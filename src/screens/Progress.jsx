import styles from './Progress.module.css'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { TopicGlyph } from '../components/TopicGlyph.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { topicStatus, lifetimeAccuracy, MASTERY_ACCURACY } from '../lib/mastery.js'

// Only judge a topic once there's enough data for the accuracy to mean something.
const IMPROVE_MIN_ANSWERED = 5

export function Progress() {
  const { t, topics, getTopic, progress, sessions, exams } = useStore()

  const allProgress = Object.values(progress)
  const totalAnswered = allProgress.reduce((sum, p) => sum + p.answered, 0)
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correct, 0)
  const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  // A study day = any day with a practice session OR a Friday exam.
  const studyDays = new Set([...sessions, ...exams].map((r) => r.date)).size

  // "Where to improve": topics you've practiced enough but whose accuracy is
  // still below the mastery bar — weakest first. `graded` is how many topics
  // have enough data at all, so we can tell "no weak spots" from "no data yet".
  const graded = topics.filter((topic) => (progress[topic.id]?.answered ?? 0) >= IMPROVE_MIN_ANSWERED)
  const weakSpots = graded
    .map((topic) => {
      const prog = progress[topic.id]
      return { topic, prog, accFrac: lifetimeAccuracy(prog), misses: prog.answered - prog.correct }
    })
    .filter((w) => w.accFrac < MASTERY_ACCURACY)
    .sort((a, b) => a.accFrac - b.accFrac)
    .slice(0, 3)

  // Same sectioning as Home's track: bucket topics by `group`, track order kept.
  const groups = []
  for (const topic of topics) {
    const key = topic.group ?? 'outros'
    let g = groups.find((x) => x.key === key)
    if (!g) { g = { key, topics: [] }; groups.push(g) }
    g.topics.push(topic)
  }

  return (
    <div className={styles.progress}>
      <h1 className={styles.title}>{t('progressTitle')}</h1>

      <section className={styles.overview}>
        <div className={styles.ovCell}>
          <div className={styles.ovValue}>{totalAnswered}</div>
          <div className={styles.ovLabel}>{t('stat_questions')}</div>
        </div>
        <div className={styles.ovCell}>
          <div className={`${styles.ovValue} ${styles.ovAccent}`}>{overallPct}%</div>
          <div className={styles.ovLabel}>{t('stat_overall')}</div>
        </div>
        <div className={styles.ovCell}>
          <div className={styles.ovValue}>{studyDays}</div>
          <div className={styles.ovLabel}>{t('stat_days')}</div>
        </div>
        <div className={styles.ovCell}>
          <div className={styles.ovValue}>{sessions.length}</div>
          <div className={styles.ovLabel}>{t('stat_sessions')}</div>
        </div>
      </section>

      {graded.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>{t('improveTitle')}</h2>
          {weakSpots.length > 0 ? (
            <div className={styles.improveList}>
              {weakSpots.map(({ topic, prog }) => (
                <div key={topic.id} className={styles.improveRow}>
                  <TopicGlyph topic={topic} size="sm" />
                  <div className={styles.improveTitles}>
                    <span className={styles.improveName}>{topic.name}</span>
                    <span className={styles.improveSub}>
                      {t('improveMisses', { misses: prog.answered - prog.correct, answered: prog.answered })}
                    </span>
                  </div>
                  <span className={styles.improvePct}>{Math.round(lifetimeAccuracy(prog) * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.improveGood}>{t('improveNone')}</p>
          )}
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>{t('byTopic')}</h2>
        {groups.map((group) => (
          <div key={group.key} className={styles.group}>
            <h3 className={styles.groupTitle}>{t(`group_${group.key}`)}</h3>
            <div className={styles.topicList}>
              {group.topics.map((topic) => {
                const prog = progress[topic.id]
                const status = topicStatus(topic, progress)
                const acc = Math.round(lifetimeAccuracy(prog) * 100)
                return (
                  <div key={topic.id} className={styles.topicRow} data-status={status}>
                    <div className={styles.topicHead}>
                      <TopicGlyph topic={topic} />
                      <div className={styles.topicTitles}>
                        <span className={styles.topicName}>{topic.name}</span>
                        <span className={styles.topicSub}>
                          <span className={styles.statusText} data-status={status}>{t(`status_${status}`)}</span>
                          {' · '}{t('topicSub', { n: (prog?.levelIndex ?? 0) + 1, m: topic.levels.length, answered: prog?.answered ?? 0 })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.accRow}>
                      <div className={styles.accBar}>
                        <ProgressBar value={lifetimeAccuracy(prog)} tone={status === 'mastered' ? 'success' : 'accent'} />
                      </div>
                      <span className={styles.accPct} data-status={status}>
                        {prog?.answered ? `${acc}%` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('recentSessions')}</h2>
        {sessions.length === 0 ? (
          <p className={styles.empty}>{t('noSessions')}</p>
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
          <h2 className={styles.sectionTitle}>{t('examsTitle')}</h2>
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
