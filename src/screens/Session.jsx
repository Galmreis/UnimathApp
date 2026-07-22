import { useEffect, useRef, useState } from 'react'
import styles from './Session.module.css'
import { Button } from '../components/Button.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { getTopic } from '../data/topics.js'
import { generateQuestion } from '../lib/generators.js'
import { checkAnswer, formatAnswer } from '../lib/checkAnswer.js'
import { randInt } from '../lib/math.js'

const EXAM_QUESTIONS = 10 // the "prova da sexta" is always 10 questions

// The training loop. Used for both practice (immediate feedback) and the exam
// (no feedback until the end). Props:
//   mode: 'practice' | 'exam'
//   topicId: which topic to drill
//   navigate: to move to the summary or back home
export function Session({ mode, topicId, navigate }) {
  const { settings, progress, commitSession, commitExam } = useStore()
  const topic = getTopic(topicId)
  const level = progress[topicId]?.levelIndex ?? 0

  // How many questions this session lasts. Time mode has no fixed count — it
  // ends when the clock runs out (handled by the timer effect below).
  const byTime = mode === 'practice' && settings.sessionMode === 'time'
  const targetCount = mode === 'exam'
    ? EXAM_QUESTIONS
    : byTime ? Infinity : settings.sessionCount

  // Build one question. Practice drills the current level; the exam mixes every
  // level up to the current one, to test the whole range you've climbed.
  function makeQuestion() {
    return generateQuestion(topicId, mode === 'exam' ? randInt(0, level) : level)
  }

  const [question, setQuestion] = useState(makeQuestion)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState('answering') // 'answering' | 'feedback'
  const [lastCorrect, setLastCorrect] = useState(false)
  const [results, setResults] = useState([]) // one boolean per answered question

  const inputRef = useRef(null)
  const startedAt = useRef(Date.now()).current
  const finishedRef = useRef(false) // guards against finishing twice (e.g. timer race)

  // The timer reads the latest results without being re-created every render.
  const resultsRef = useRef(results)
  useEffect(() => { resultsRef.current = results }, [results])

  // Put the cursor in the input whenever a new question appears. During feedback
  // the "Próxima" button auto-focuses itself (see autoFocus below), so Enter
  // moves on without touching the mouse.
  useEffect(() => {
    if (phase === 'answering') inputRef.current?.focus()
  }, [phase, question])

  // Time mode: tick every second to update the countdown and end when it hits 0.
  const [now, setNow] = useState(startedAt)
  useEffect(() => {
    if (!byTime) return
    const deadline = startedAt + settings.sessionMinutes * 60000
    const id = setInterval(() => {
      if (Date.now() >= deadline) finish(resultsRef.current)
      else setNow(Date.now())
    }, 500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish(finalResults) {
    if (finishedRef.current) return // never commit/navigate twice
    finishedRef.current = true
    // A timed session can run out before any answer — don't log an empty session.
    if (finalResults.length === 0) { navigate('home'); return }
    const durationMs = Date.now() - startedAt
    if (mode === 'exam') {
      const correct = finalResults.filter(Boolean).length
      commitExam({ topicId, correct, total: finalResults.length, levelIndex: level })
      navigate('summary', { result: { mode: 'exam', topicId, results: finalResults, durationMs, levelIndex: level } })
    } else {
      commitSession({ topicId, results: finalResults, durationMs })
      navigate('summary', { result: { mode: 'practice', topicId, results: finalResults, durationMs } })
    }
  }

  // User submits an answer.
  function submit(event) {
    event.preventDefault()
    if (input.trim() === '') return
    const correct = checkAnswer(input, question)
    const next = [...results, correct]
    setResults(next)

    if (mode === 'exam') {
      // No feedback in the exam — record and move on (or finish).
      if (next.length >= targetCount) finish(next)
      else { setQuestion(makeQuestion()); setInput('') }
      return
    }
    // Practice: show whether it was right, then wait for "Próxima".
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

  function quit() {
    if (window.confirm('Sair da sessão? O que você fez agora não será salvo.')) {
      navigate('home')
    }
  }

  const answered = results.length
  const shownNumber = phase === 'feedback' ? answered : answered + 1
  const isLastCount = Number.isFinite(targetCount) && results.length >= targetCount
  const sessionProgress = byTime
    ? Math.min(1, (now - startedAt) / (settings.sessionMinutes * 60000))
    : answered / targetCount

  return (
    <div className={styles.session}>
      <header className={styles.top}>
        <button className={styles.close} onClick={quit} aria-label="Sair da sessão">✕</button>
        <div className={styles.meta}>
          <span className={styles.topicName}>{topic.name}{mode === 'exam' && ' · Prova'}</span>
          <span className={styles.counter}>
            {byTime ? `⏱ ${formatClock(startedAt + settings.sessionMinutes * 60000 - now)}` : `Questão ${shownNumber} de ${targetCount}`}
          </span>
        </div>
        <ProgressBar value={sessionProgress} />
      </header>

      <div className={styles.card}>
        <p className={styles.prompt}>{question.prompt}</p>

        <form onSubmit={submit}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(sanitizeAnswer(e.target.value, question.kind))}
            inputMode={question.kind === 'fraction' || question.signed ? 'text' : 'decimal'}
            placeholder={question.kind === 'fraction' ? 'ex.: 3/4' : 'sua resposta'}
            autoComplete="off"
            enterKeyHint="go"
            disabled={phase === 'feedback'}
            aria-label="Sua resposta"
          />

          {phase === 'answering' && (
            <Button type="submit" full disabled={input.trim() === ''}>Responder</Button>
          )}
        </form>

        {phase === 'feedback' && (
          <>
            <div className={styles.feedback} data-correct={lastCorrect}>
              {lastCorrect ? 'Certo!' : <>Errou — resposta certa: <strong>{formatAnswer(question)}</strong></>}
            </div>
            {settings.showExplanations && (
              <ol className={styles.steps} aria-label="Passo a passo">
                {question.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {settings.showTips && question.tips.length > 0 && (
              <div className={styles.tip}>
                <span className={styles.tipLabel}>Dica</span>
                {question.tips.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
            <Button autoFocus full onClick={goNext}>
              {isLastCount ? 'Ver resumo' : 'Próxima'}
            </Button>
          </>
        )}

        {mode === 'exam' && (
          <p className={styles.examNote}>Prova sem correção na hora — o resultado aparece no fim.</p>
        )}
      </div>
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
