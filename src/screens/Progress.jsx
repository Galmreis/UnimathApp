import styles from './Progress.module.css'
import { StatTile } from '../components/StatTile.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { TopicGlyph } from '../components/TopicGlyph.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { TOPICS, getTopic } from '../data/topics.js'
import { topicStatus, lifetimeAccuracy } from '../lib/mastery.js'

const STATUS_LABEL = {
  locked: 'Bloqueado',
  available: 'Disponível',
  in_progress: 'Em andamento',
  mastered: 'Fixado',
}

export function Progress() {
  const { progress, sessions, exams } = useStore()

  const allProgress = Object.values(progress)
  const totalAnswered = allProgress.reduce((sum, p) => sum + p.answered, 0)
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correct, 0)
  const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  // A study day = any day with a practice session OR a Friday exam.
  const studyDays = new Set([...sessions, ...exams].map((r) => r.date)).size

  return (
    <div className={styles.progress}>
      <h1 className={styles.title}>Progresso</h1>

      <section className={styles.stats}>
        <StatTile value={totalAnswered} label="questões" />
        <StatTile value={`${overallPct}%`} label="acerto geral" />
        <StatTile value={studyDays} label="dias" />
        <StatTile value={sessions.length} label="sessões" />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Por tópico</h2>
        <div className={styles.topicList}>
          {TOPICS.map((topic) => {
            const prog = progress[topic.id]
            const status = topicStatus(topic, progress)
            const acc = Math.round(lifetimeAccuracy(prog) * 100)
            return (
              <div key={topic.id} className={styles.topicRow}>
                <div className={styles.topicHead}>
                  <span className={styles.topicName}>
                    <TopicGlyph topic={topic} size="sm" />
                    {topic.name}
                  </span>
                  <span className={styles.topicStatus} data-status={status}>{STATUS_LABEL[status]}</span>
                </div>
                <div className={styles.topicSub}>
                  Nível {(prog?.levelIndex ?? 0) + 1}/{topic.levels.length} · {prog?.answered ?? 0} questões · {acc}% de acerto
                </div>
                <ProgressBar value={lifetimeAccuracy(prog)} tone={status === 'mastered' ? 'success' : 'accent'} />
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Últimas sessões</h2>
        {sessions.length === 0 ? (
          <p className={styles.empty}>Você ainda não treinou. Que tal começar agora?</p>
        ) : (
          <ul className={styles.history}>
            {sessions.slice(0, 8).map((s, i) => (
              <li key={i} className={styles.historyRow}>
                <span>{formatDate(s.date)} · {getTopic(s.topicId)?.name}</span>
                <span className={styles.historyScore}>{s.correct}/{s.total} · {s.total ? Math.round((s.correct / s.total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {exams.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Provas da sexta</h2>
          <ul className={styles.history}>
            {exams.slice(0, 8).map((e, i) => (
              <li key={i} className={styles.historyRow}>
                <span>{formatDate(e.date)} · {getTopic(e.topicId)?.name}</span>
                <span className={styles.historyScore}>{e.correct}/{e.total}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// "2026-07-22" -> "22/07"
function formatDate(iso) {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}
