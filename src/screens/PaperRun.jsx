import { useRef, useState } from 'react'
import styles from './PaperRun.module.css'
import { Button } from '../components/Button.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { drawPaperSet, localizePaper, letterFor, isPaperCorrect } from '../lib/papers.js'

// One round of the "Provas" mode. This is the multiple-choice sibling of
// screens/Session.jsx: the questions come from the bank instead of a generator,
// the answer is one of five alternatives instead of a typed number, and the
// result deliberately does NOT touch the learning track (see the store's
// commitPaperRound).
//
// Three phases, same shape as the practice loop: answering -> feedback ->
// (repeat) -> result.
export function PaperRun({ setup, navigate }) {
  const { t, lang, getTopic, commitPaperRound } = useStore()

  // Drawn once, in a state initialiser: re-rendering must never reshuffle the
  // round under the user's feet.
  const [questions] = useState(() => drawPaperSet(setup))
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState(null)      // picked alternative, not yet confirmed
  const [phase, setPhase] = useState('answering') // 'answering' | 'feedback' | 'result'
  const [answers, setAnswers] = useState([])      // { id, chosen, correct } per question
  const startedAt = useRef(Date.now()).current

  // A filter with nothing behind it: nothing to run, so offer the way back.
  if (questions.length === 0) {
    return (
      <div className={styles.run}>
        <p className={styles.empty}>{t('papers_empty')}</p>
        <Button variant="ghost" full onClick={() => navigate('papers')}>{t('papers_backToSetup')}</Button>
      </div>
    )
  }

  const question = localizePaper(questions[index], lang)
  const correctCount = answers.filter((a) => a.correct).length
  const isLast = index === questions.length - 1

  function confirm() {
    if (chosen === null) return
    setAnswers([...answers, { id: question.id, chosen, correct: isPaperCorrect(question, chosen) }])
    setPhase('feedback')
  }

  function next() {
    if (!isLast) {
      setIndex(index + 1)
      setChosen(null)
      setPhase('answering')
      return
    }
    // Last question answered: log the round and switch to the result view.
    const total = answers.length
    commitPaperRound({
      source: setup?.source ?? 'all',
      topicId: setup?.topicId ?? 'all',
      correct: answers.filter((a) => a.correct).length,
      total,
      durationMs: Date.now() - startedAt,
    })
    setPhase('result')
  }

  function leave() {
    if (window.confirm(t('papers_leaveConfirm'))) navigate('papers')
  }

  if (phase === 'result') {
    const total = answers.length
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    return (
      <div className={styles.run}>
        <div className={styles.resultHero}>
          <div className={styles.resultPct}>{pct}%</div>
          <div className={styles.resultScore}>{t('ofCorrect', { correct: correctCount, total })}</div>
          <div className={styles.resultSub}>{t('papers_result_t')}</div>
        </div>

        <h2 className={styles.reviewTitle}>{t('papers_review')}</h2>
        <ol className={styles.review}>
          {answers.map((answer, i) => {
            const q = localizePaper(questions[i], lang)
            return (
              <li key={answer.id} className={styles.reviewRow} data-correct={answer.correct}>
                <span className={styles.reviewMark} aria-hidden>{answer.correct ? '✓' : '✕'}</span>
                <span className={styles.reviewText}>
                  <span className={styles.reviewSource}>
                    {q.source}{q.year ? ` ${q.year}` : ''} · {getTopic(q.topicId)?.name ?? q.topicId}
                  </span>
                  <span className={styles.reviewAnswer}>
                    {t('papers_yourAnswer', { letter: letterFor(answer.chosen).toUpperCase() })}
                    {!answer.correct && <> · {t('papers_right', { letter: letterFor(q.correct).toUpperCase() })}</>}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>

        <p className={styles.note}>{t('papers_note')}</p>

        <div className={styles.actions}>
          <Button size="big" full onClick={() => navigate('paperRun', { setup, runId: Date.now() })}>
            {t('papers_again')}
          </Button>
          <Button variant="ghost" full onClick={() => navigate('papers')}>{t('papers_backToSetup')}</Button>
        </div>
      </div>
    )
  }

  const answered = answers.length

  return (
    <div className={styles.run}>
      <header className={styles.top}>
        <button className={styles.close} onClick={leave} aria-label={t('quitAria')}>✕</button>
        <div className={styles.meta}>
          <span className={styles.source}>
            {question.source}{question.year ? ` ${question.year}` : ''}
            {question.number ? ` · ${question.number}` : ''}
          </span>
          <span className={styles.counter}>{t('papers_of', { n: index + 1, m: questions.length })}</span>
        </div>
        <ProgressBar value={answered / questions.length} />
      </header>

      <div className={styles.card}>
        <span className={styles.tag}>{getTopic(question.topicId)?.name ?? question.topicId} · {t(`origin_${question.origin}`)}</span>
        <p className={styles.statement}>{question.statement}</p>

        <ul className={styles.alternatives} aria-label={t('papers_alternativesAria')}>
          {question.alternatives.map((text, i) => {
            // In feedback the right answer is always marked; a wrong pick is
            // marked too, so the user sees both what they chose and what was right.
            const state = phase === 'feedback'
              ? i === question.correct ? 'right' : i === chosen ? 'wrong' : 'idle'
              : i === chosen ? 'picked' : 'idle'
            return (
              <li key={i}>
                <button
                  className={styles.alternative}
                  data-state={state}
                  disabled={phase === 'feedback'}
                  onClick={() => setChosen(i)}
                  aria-pressed={chosen === i}
                >
                  <span className={styles.letter}>{letterFor(i)}</span>
                  <span className={styles.altText}>{text}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {phase === 'answering' && (
          <Button full disabled={chosen === null} onClick={confirm}>{t('papers_confirm')}</Button>
        )}

        {phase === 'feedback' && (
          <>
            <div className={styles.feedback} data-correct={chosen === question.correct}>
              {chosen === question.correct
                ? t('correct')
                : <>{t('wrongPrefix')} <strong>{letterFor(question.correct).toUpperCase()}</strong></>}
            </div>

            <div className={styles.solution}>
              <span className={styles.solutionLabel}>{t('papers_solution')}</span>
              <ol>
                {question.solution.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
            </div>

            {question.origin === 'authored' && (
              <p className={styles.originNote}>{t('papers_authoredNote')}</p>
            )}

            <Button autoFocus full onClick={next}>
              {isLast ? t('papers_finish') : t('next')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
