import styles from './Home.module.css'
import { Button } from '../components/Button.jsx'
import { StatTile } from '../components/StatTile.jsx'
import { TopicCard } from '../components/TopicCard.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { TOPICS, getTopic } from '../data/topics.js'
import { topicStatus, recentAccuracy, emptyProgress } from '../lib/mastery.js'

export function Home({ navigate }) {
  const { progress, sessions, exams, currentTopicId } = useStore()

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
        <p className={styles.tagline}><i>Matemática não é talento, é treino!</i></p>
      </header>

      <section className={styles.cta}>
        <div className={styles.now}>
          Agora: <strong>{currentTopic.name}</strong> · Nível {currentLevel + 1}/{currentTopic.levels.length}
        </div>
        <Button size="big" full onClick={() => navigate('session', { topicId: currentTopicId })}>
          Treinar agora
        </Button>
        <Button variant="ghost" full onClick={() => navigate('exam', { topicId: currentTopicId })}>
          Prova da sexta
        </Button>
      </section>

      <section className={styles.stats}>
        <StatTile value={studyDays} label="dias estudados" />
        <StatTile value={totalAnswered} label="questões" />
        <StatTile value={`${overallPct}%`} label="acerto geral" />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Sua trilha</h2>
        <div className={styles.track}>
          {TOPICS.map((topic) => {
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
