import styles from './Home.module.css'
import { Button } from '../components/Button.jsx'
import { StatTile } from '../components/StatTile.jsx'
import { TopicCard } from '../components/TopicCard.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { topicStatus, recentAccuracy, emptyProgress } from '../lib/mastery.js'

export function Home({ navigate }) {
  const { t, topics, getTopic, progress, sessions, exams, currentTopicId } = useStore()

  const currentTopic = getTopic(currentTopicId)
  const currentLevel = progress[currentTopicId]?.levelIndex ?? 0

  // Overall stats — the numbers that should go up. No streaks, no guilt.
  const allProgress = Object.values(progress)
  const totalAnswered = allProgress.reduce((sum, p) => sum + p.answered, 0)
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correct, 0)
  const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  // A study day = any day with a practice session OR a Friday exam.
  const studyDays = new Set([...sessions, ...exams].map((r) => r.date)).size

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <h1 className={styles.title}>Unimath</h1>
        <p className={styles.tagline}><i>{t('tagline')}</i></p>
      </header>

      <section className={styles.cta}>
        <div className={styles.now}>
          {t('now')}: <strong>{currentTopic.name}</strong> · {t('level_of', { n: currentLevel + 1, m: currentTopic.levels.length })}
        </div>
        <Button size="big" full onClick={() => navigate('session', { topicId: currentTopicId })}>
          {t('trainNow')}
        </Button>
        <Button variant="ghost" full onClick={() => navigate('exam', { topicId: currentTopicId })}>
          {t('fridayExam')}
        </Button>
      </section>

      <section className={styles.stats}>
        <StatTile value={studyDays} label={t('stat_daysStudied')} />
        <StatTile value={totalAnswered} label={t('stat_questions')} />
        <StatTile value={`${overallPct}%`} label={t('stat_overall')} />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('yourTrack')}</h2>
        <div className={styles.track}>
          {topics.map((topic) => {
            const prog = progress[topic.id] ?? emptyProgress()
            const status = topicStatus(topic, progress)
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                status={status}
                levelIndex={prog.levelIndex}
                accuracy={status === 'mastered' ? 1 : recentAccuracy(prog)}
                onStart={(levelIndex) => navigate('session', { topicId: topic.id, levelIndex })}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
