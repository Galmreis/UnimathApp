import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Session.module.css'
import { Button } from '../components/Button.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { generateQuestion } from '../lib/generators.js'
import { checkAnswer, formatAnswer } from '../lib/checkAnswer.js'
import { randInt, pick } from '../lib/math.js'
import { MATCH_QUESTIONS, matchPool, matchOutcome, applyMatchResult } from '../lib/ranks.js'

const EXAM_LENGTH = 10 // the "prova da sexta" is always 10 questions

// The training loop, in three flavours. Props:
//   mode: 'practice' | 'exam' | 'match'
//   topicId: which topic to drill (practice/exam; a match mixes topics)
//   levelIndex: practice only — review an already-passed level
//   resume: a paused-session snapshot to continue from (practice only)
//   navigate: to move to the summary or back home
//
// practice  immediate feedback, steps and the Dica; can be paused and resumed.
// exam      the prova da sexta: 10 questions of one topic, no feedback until the end.
// match     the rank match: 10 questions drawn from the whole track ladder at
//           the difficulty of your rank, no feedback until the end.
export function Session({ mode, topicId, levelIndex, resume, navigate }) {
  const {
    settings, t, lang, getTopic, topics, progress, rank,
    commitSession, commitExam, commitMatch, savePending, clearPending,
  } = useStore()

  const isMatch = mode === 'match'
  const isPractice = mode === 'practice'
  const topic = isMatch ? null : getTopic(topicId)

  // Practice can target any reached level (levelIndex prop, for reviewing an old
  // one); default to the current level. A resumed session keeps the level it was
  // started at. The exam always runs at the current level.
  const level = resume?.level ?? levelIndex ?? progress[topicId]?.levelIndex ?? 0

  // The rank a match is judged against is fixed when it starts, so committing
  // the result can't shift the questions or the message halfway through.
  const matchStep = useRef(rank.step).current
  const pool = useMemo(() => (isMatch ? matchPool(matchStep, topics) : []), [isMatch, matchStep, topics])

  // How long this session lasts. Time mode has no fixed count — it ends when the
  // clock runs out (handled by the timer effect below). A resumed session uses
  // the shape it was started with, so changing the setting while it was paused
  // can't stretch or truncate it.
  const byTime = isPractice && (resume ? resume.byTime : settings.sessionMode === 'time')
  const totalMs = resume?.totalMs ?? settings.sessionMinutes * 60000
  const targetCount = mode === 'exam'
    ? EXAM_LENGTH
    : isMatch ? MATCH_QUESTIONS
      : byTime ? Infinity : (resume?.targetCount ?? settings.sessionCount)

  // Build one question. Practice drills the chosen level; the exam mixes every
  // level up to the current one; a match picks a rung of the global ladder (so
  // the question can come from any topic — we tag it with the one it came from).
  function makeQuestion() {
    if (isMatch) {
      const rung = pick(pool)
      return { ...generateQuestion(rung.topicId, rung.level, lang), topicId: rung.topicId }
    }
    return generateQuestion(topicId, mode === 'exam' ? randInt(0, level) : level, lang)
  }

  const [question, setQuestion] = useState(makeQuestion)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState('answering') // 'answering' | 'feedback'
  const [lastCorrect, setLastCorrect] = useState(false)
  const [results, setResults] = useState(resume?.results ?? []) // one boolean per answered question
  const [paused, setPaused] = useState(false)     // is the pause sheet open?
  const [resumed, setResumed] = useState(Boolean(resume)) // show the "picking up" note once

  const inputRef = useRef(null)
  // A resumed session carries its elapsed time, so the clock continues instead
  // of restarting: pretend it started that many milliseconds ago.
  const startedAt = useRef(Date.now() - (resume?.elapsedMs ?? 0)).current
  const finishedRef = useRef(false) // guards against finishing twice (e.g. timer race)

  // The timer reads the latest results without being re-created every render.
  const resultsRef = useRef(results)
  useEffect(() => { resultsRef.current = results }, [results])

  // Put the cursor in the input whenever a new question appears. During feedback
  // the "Próxima" button auto-focuses itself (see autoFocus below), so Enter
  // moves on without touching the mouse.
  useEffect(() => {
    if (phase === 'answering' && !paused) inputRef.current?.focus()
  }, [phase, question, paused])

  // Time mode: tick every second to update the countdown and end when it hits 0.
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!byTime) return
    const deadline = startedAt + totalMs
    const id = setInterval(() => {
      if (Date.now() >= deadline) finish(resultsRef.current)
      else setNow(Date.now())
    }, 500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Everything needed to rebuild this session later. Written after every answer
  // (see submit) so even closing the tab mid-session doesn't lose it.
  function snapshot(currentResults) {
    return {
      topicId,
      level,
      results: currentResults,
      byTime,
      targetCount: Number.isFinite(targetCount) ? targetCount : null,
      totalMs: byTime ? totalMs : null,
      elapsedMs: Date.now() - startedAt,
    }
  }

  function finish(finalResults) {
    if (finishedRef.current) return // never commit/navigate twice
    finishedRef.current = true
    // A timed session can run out before any answer — don't log an empty session.
    if (finalResults.length === 0) {
      if (isPractice) clearPending()
      navigate('home')
      return
    }
    const durationMs = Date.now() - startedAt
    const correct = finalResults.filter(Boolean).length

    if (mode === 'exam') {
      commitExam({ topicId, correct, total: finalResults.length, levelIndex: level })
      navigate('summary', { result: { mode: 'exam', topicId, results: finalResults, durationMs, levelIndex: level } })
      return
    }
    if (isMatch) {
      // Compute the outcome with the same pure functions the store uses, so the
      // message on the summary always matches the step that was saved.
      const total = finalResults.length
      commitMatch({ correct, total })
      navigate('summary', {
        result: {
          mode: 'match',
          topicId: null,
          results: finalResults,
          durationMs,
          rank: {
            from: matchStep,
            to: applyMatchResult(matchStep, correct, total),
            outcome: matchOutcome(matchStep, correct, total),
          },
        },
      })
      return
    }
    // Practice: commitSession also clears the paused session for us.
    commitSession({ topicId, results: finalResults, durationMs, level })
    navigate('summary', { result: { mode: 'practice', topicId, results: finalResults, durationMs } })
  }

  // User submits an answer.
  function submit(event) {
    event.preventDefault()
    if (input.trim() === '') return
    const correct = checkAnswer(input, question)
    const next = [...results, correct]
    setResults(next)
    setResumed(false)

    if (mode === 'exam' || isMatch) {
      // No feedback in an assessment — record and move on (or finish).
      if (next.length >= targetCount) finish(next)
      else { setQuestion(makeQuestion()); setInput('') }
      return
    }
    // Practice: keep the paused-session snapshot current, then show the feedback.
    savePending(snapshot(next))
    setLastCorrect(correct)
    setPhase('feedback')
  }

  // User dismisses the feedback and moves on (practice only).
  function goNext() {
    if (results.length >= targetCount) { finish(results); return } // count mode: done
    setPhase('answering')
    setInput('')
    setQuestion(makeQuestion())
  }

  // Pause and leave: keep the snapshot so Home can offer "Continuar".
  function pauseAndLeave() {
    savePending(snapshot(results))
    navigate('home')
  }

  // Leave and throw the session away.
  function quitAndDiscard() {
    if (isPractice) clearPending()
    navigate('home')
  }

  const answered = results.length
  const shownNumber = phase === 'feedback' ? answered : answered + 1
  const isLastCount = Number.isFinite(targetCount) && results.length >= targetCount
  const sessionProgress = byTime
    ? Math.min(1, (now - startedAt) / totalMs)
    : answered / targetCount
  // A match names the topic of the question at hand; practice and the exam name
  // the topic of the whole session.
  const headerName = isMatch ? t('rank_matchTag') : topic.name
  const questionTopic = isMatch ? getTopic(question.topicId) : null

  return (
    <div className={styles.session}>
      <header className={styles.top}>
        <button className={styles.close} onClick={() => setPaused(true)} aria-label={t('quitAria')}>✕</button>
        <div className={styles.meta}>
          <span className={styles.topicName}>{headerName}{mode === 'exam' && ` · ${t('examTag')}`}</span>
          <span className={styles.counter}>
            {byTime ? `⏱ ${formatClock(startedAt + totalMs - now)}` : t('questionOf', { n: shownNumber, m: targetCount })}
          </span>
        </div>
        <ProgressBar value={sessionProgress} />
        {resumed && <p className={styles.resumed}>{t('resumedNote')}</p>}
      </header>

      <div className={styles.card}>
        {questionTopic && <span className={styles.questionTag}>{questionTopic.name}</span>}
        <p className={styles.prompt}>{question.prompt}</p>

        <form onSubmit={submit}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(sanitizeAnswer(e.target.value, question.kind))}
            inputMode={question.kind === 'fraction' || question.signed ? 'text' : 'decimal'}
            placeholder={question.kind === 'fraction' ? t('answerPlaceholderFraction') : t('answerPlaceholder')}
            autoComplete="off"
            enterKeyHint="go"
            disabled={phase === 'feedback'}
            aria-label={t('answerAria')}
          />

          {phase === 'answering' && (
            <Button type="submit" full disabled={input.trim() === ''}>{t('submit')}</Button>
          )}
        </form>

        {phase === 'feedback' && (
          <>
            <div className={styles.feedback} data-correct={lastCorrect}>
              {lastCorrect ? t('correct') : <>{t('wrongPrefix')} <strong>{formatAnswer(question, lang)}</strong></>}
            </div>
            {settings.showExplanations && (
              <ol className={styles.steps} aria-label={t('stedAria')}>
                {question.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {settings.showTips && question.tips.length > 0 && (
              <div className={styles.tip}>
                <span className={styles.tipLabel}>{t('tipLabel')}</span>
                {question.tips.map((tip, i) => (
                  <p key={i}>{tip}</p>
                ))}
              </div>
            )}
            <Button autoFocus full onClick={goNext}>
              {isLastCount ? t('seeSummary') : t('next')}
            </Button>
          </>
        )}

        {mode === 'exam' && <p className={styles.examNote}>{t('examNote')}</p>}
        {isMatch && <p className={styles.examNote}>{t('rank_matchNote')}</p>}
      </div>

      {/* The pause sheet. It replaces the old window.confirm() because there are
          three answers now, not two — and only practice can actually be paused. */}
      {paused && (
        <div className={styles.sheetWrap} role="dialog" aria-modal="true" aria-label={t('pause_title')}>
          <div className={styles.sheetBackdrop} onClick={() => setPaused(false)} />
          <div className={styles.sheet}>
            <h2 className={styles.sheetTitle}>{t('pause_title')}</h2>
            <p className={styles.sheetBody}>
              {isPractice ? t('pause_body') : isMatch ? t('pause_bodyMatch') : t('pause_bodyExam')}
            </p>
            <Button autoFocus full onClick={() => setPaused(false)}>{t('pause_resume')}</Button>
            {isPractice && answered > 0 && (
              <Button variant="ghost" full onClick={pauseAndLeave}>{t('pause_save')}</Button>
            )}
            <Button variant="danger" full onClick={quitAndDiscard}>{t('pause_quit')}</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Milliseconds -> "m:ss" (never negative).
function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

// Keep only characters that can form a valid answer: digits, a decimal
// separator (, or .) and a minus sign — plus "/" for fractions. This stops
// letters (or a pasted word) from ending up in the answer box.
function sanitizeAnswer(value, kind) {
  const allowed = kind === 'fraction' ? /[^0-9/.,-]/g : /[^0-9.,-]/g
  return value.replace(allowed, '')
}
