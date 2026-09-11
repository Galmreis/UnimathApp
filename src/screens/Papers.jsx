import { useState } from 'react'
import styles from './Papers.module.css'
import { Button } from '../components/Button.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { EXAM_QUESTIONS } from '../data/exams.js'
import {
  availableSources, availableTopicIds, countPapers, PAPER_SET_OPTIONS, PAPER_SET_SIZE,
} from '../lib/papers.js'

// The setup screen of the "Provas" mode: pick an exam board, a topic and how
// many questions, then run the round (screens/PaperRun.jsx).
//
// The filters are built from the bank itself (lib/papers.js reads data/exams.js),
// so cataloguing a new paper makes it selectable here with no code change.
export function Papers({ navigate }) {
  const { t, getTopic, papers } = useStore()

  const sources = availableSources()
  const topicIds = availableTopicIds()

  const [source, setSource] = useState('all')
  const [topicId, setTopicId] = useState('all')
  const [count, setCount] = useState(PAPER_SET_SIZE)

  const available = countPapers({ source, topicId })

  return (
    <div className={styles.papers}>
      <PageHeader title={t('papers_title')} intro={t('papers_intro')} onBack={() => navigate('more')} />

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('papers_source')}</h2>
        <div className={styles.chips}>
          <button data-active={source === 'all'} onClick={() => setSource('all')}>{t('papers_all')}</button>
          {sources.map((id) => (
            <button key={id} data-active={source === id} onClick={() => setSource(id)}>{id}</button>
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('papers_topic')}</h2>
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            aria-label={t('papers_topic')}
          >
            <option value="all">{t('papers_anyTopic')}</option>
            {topicIds.map((id) => (
              <option key={id} value={id}>{getTopic(id)?.name ?? id}</option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('papers_size')}</h2>
        <div className={styles.chips}>
          {PAPER_SET_OPTIONS.map((n) => (
            <button key={n} data-active={count === n} onClick={() => setCount(n)}>{t('nQuestions', { n })}</button>
          ))}
        </div>
        <p className={styles.available}>{t('papers_available', { n: available })}</p>
      </section>

      <section className={styles.cta}>
        <Button
          size="big"
          full
          disabled={available === 0}
          onClick={() => navigate('paperRun', { setup: { source, topicId, count }, runId: Date.now() })}
        >
          {t('papers_start')}
        </Button>
        {available === 0 && <p className={styles.empty}>{t('papers_empty')}</p>}
        <p className={styles.note}>{t('papers_note')}</p>
      </section>

      {papers.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>{t('papers_history')}</h2>
          <ul className={styles.history}>
            {papers.slice(0, 8).map((round, i) => (
              <li key={i} className={styles.historyRow}>
                <span className={styles.historyWhen}>
                  {formatDate(round.date)} · {round.source === 'all' ? t('papers_filterAll') : round.source}
                </span>
                <span className={styles.historyScore}>
                  {round.correct}/{round.total} · {round.total ? Math.round((round.correct / round.total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.bankNote}>{t('papers_bankSize', { n: EXAM_QUESTIONS.length })}</p>
    </div>
  )
}

// "2026-07-22" -> "22/07"
function formatDate(iso) {
  const [, month, day] = String(iso).split('-')
  return `${day}/${month}`
}
