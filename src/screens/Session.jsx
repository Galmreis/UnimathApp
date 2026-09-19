import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Session.module.css'
import { Button } from '../components/Button.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { generateQuestion } from '../lib/generators.js'
import { checkAnswer, formatAnswer } from '../lib/checkAnswer.js'
import { randInt, pick } from '../lib/math.js'
import { MATCH_QUESTIONS, matchPool, matchOutcome, applyMatchResult } from '../lib/ranks.js'

const EXAM_LENGTH = 10 // prova da sexta é sempre 10 questões

// Três modos:
//   practice  feedback na hora, com passos e Dica. Dá pra pausar.
//   exam      prova da sexta, 10 questões de um tópico, feedback só no fim.
//   match     teste de rank, 10 questões da escada inteira, feedback só no fim.
export function Session({ mode, topicId, levelIndex, resume, navigate }) {
  const {
    settings, t, lang, getTopic, topics, progress, rank,
    commitSession, commitExam, commitMatch, savePending, clearPending,
  } = useStore()

  const isMatch = mode === 'match'
  const isPractice = mode === 'practice'
  const topic = isMatch ? null : getTopic(topicId)

  // Sessão retomada mantém o nível em que começou.
  const level = resume?.level ?? levelIndex ?? progress[topicId]?.levelIndex ?? 0

  // Rank fixado no início, senão commitar o resultado mexia nas questões no meio.
  const matchStep = useRef(rank.step).current
  const pool = useMemo(() => (isMatch ? matchPool(matchStep, topics) : []), [isMatch, matchStep, topics])

  // Sessão retomada usa o formato com que começou: mudar o ajuste enquanto ela
  // estava pausada não pode esticar nem cortar ela.
  const byTime = isPractice && (resume ? resume.byTime : settings.sessionMode === 'time')
  const totalMs = resume?.totalMs ?? settings.sessionMinutes * 60000
  const targetCount = mode === 'exam'
    ? EXAM_LENGTH
    : isMatch ? MATCH_QUESTIONS
      : byTime ? Infinity : (resume?.targetCount ?? settings.sessionCount)

  // Exam mistura todos os níveis até o atual. Match sorteia da escada global, daí
  // a questão pode vir de qualquer tópico e a gente marca de qual veio.
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
  const [paused, setPaused] = useState(false)     // ficha de pausa aberta?
  const [resumed, setResumed] = useState(Boolean(resume)) // mostra o aviso de retomada uma vez

  const inputRef = useRef(null)
  // Finge que começou há X ms pro relógio continuar em vez de zerar.
  const startedAt = useRef(Date.now() - (resume?.elapsedMs ?? 0)).current
  const finishedRef = useRef(false) // guards against finishing twice (e.g. timer race)

  // Timer lê o results atual sem se recriar todo render.
  const resultsRef = useRef(results)
  useEffect(() => { resultsRef.current = results }, [results])

  // Cursor no input a cada questão nova. No feedback quem pega o foco é o botão
  // Próxima, então dá pra ir até o fim só no Enter.
  useEffect(() => {
    if (phase === 'answering' && !paused) inputRef.current?.focus()
  }, [phase, question, paused])

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

  // Gravado a cada resposta, então fechar a aba no meio não perde.
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
    // Sessão por tempo pode acabar sem nenhuma resposta. Não loga vazia.
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
      // Mesmas funções puras que o store usa, senão a mensagem do resumo
      // discorda do step que foi salvo.
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
      commitSession({ topicId, results: finalResults, durationMs, level })
    navigate('summary', { result: { mode: 'practice', topicId, results: finalResults, durationMs } })
  }

  function submit(event) {
    event.preventDefault()
    if (input.trim() === '') return
    const correct = checkAnswer(input, question)
    const next = [...results, correct]
    setResults(next)
    setResumed(false)

    if (mode === 'exam' || isMatch) {
      // Avaliação não dá feedback: registra e segue.
      if (next.length >= targetCount) finish(next)
      else { setQuestion(makeQuestion()); setInput('') }
      return
    }
    savePending(snapshot(next))
    setLastCorrect(correct)
    setPhase('feedback')
  }


  function goNext() {
    if (results.length >= targetCount) { finish(results); return } // count mode: done
    setPhase('answering')
    setInput('')
    setQuestion(makeQuestion())
  }

  // Pausa e sai: guarda o snapshot pra Home oferecer "Continuar".
  function pauseAndLeave() {
    savePending(snapshot(results))
    navigate('home')
  }


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
  // No match cada questão carrega seu próprio tópico; em practice/exam é um só.
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

      {/* Era um window.confirm, mas agora são três respostas e não duas. */}
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

// Só deixa passar dígito, separador decimal, sinal de menos e "/" pra fração.
function sanitizeAnswer(value, kind) {
  const allowed = kind === 'fraction' ? /[^0-9/.,-]/g : /[^0-9.,-]/g
  return value.replace(allowed, '')
}
