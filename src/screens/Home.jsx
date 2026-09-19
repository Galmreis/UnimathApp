import styles from './Home.module.css'
import { Button } from '../components/Button.jsx'
import { Icon } from '../components/Icon.jsx'
import { StatTile } from '../components/StatTile.jsx'
import { TopicCard } from '../components/TopicCard.jsx'
import { RankBadge } from '../components/RankBadge.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { topicStatus, recentAccuracy, emptyProgress } from '../lib/mastery.js'

export function Home({ navigate }) {
  const {
    t, topics, getTopic, progress, sessions, exams, currentTopicId,
    rank, pending, clearPending,
  } = useStore()

  const currentTopic = getTopic(currentTopicId)
  const currentLevel = progress[currentTopicId]?.levelIndex ?? 0

  // Sem streak: faltar um dia não pode virar punição.
  const allProgress = Object.values(progress)
  const totalAnswered = allProgress.reduce((sum, p) => sum + p.answered, 0)
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correct, 0)
  const overallPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  // A study day = any day with a practice session OR a Friday exam.
  const studyDays = new Set([...sessions, ...exams].map((r) => r.date)).size

  const groups = []
  for (const topic of topics) {
    const key = topic.group ?? 'outros'
    let g = groups.find((x) => x.key === key)
    if (!g) { g = { key, topics: [] }; groups.push(g) }
    g.topics.push(topic)
  }

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <button className={styles.rankChip} onClick={() => navigate('rank', { from: 'home' })} aria-label={t('rank_title')}>
            <RankBadge step={rank.step} size="sm" />
          </button>
          <button className={styles.helpBtn} onClick={() => navigate('help', { from: 'home' })} aria-label={t('help_title')}>
            <Icon name="help" size={20} />
          </button>
        </div>
        <h1 className={styles.title}>Unimath</h1>
        <p className={styles.tagline}><i>{t('tagline')}</i></p>
      </header>

      {/* Antes do "Treinar agora": a oferta só serve onde a pessoa cai. */}
      {pending && (
        <section className={styles.pending}>
          <div className={styles.pendingHead}>
            <span className={styles.pendingIcon} aria-hidden><Icon name="pause" size={18} /></span>
            <div className={styles.pendingTitles}>
              <span className={styles.pendingTitle}>{t('pending_title')}</span>
              <span className={styles.pendingWhere}>
                {t('pending_where', {
                  topic: getTopic(pending.topicId)?.name ?? pending.topicId,
                  n: (pending.level ?? 0) + 1,
                })}
              </span>
            </div>
          </div>
          <p className={styles.pendingSub}>{pendingSubtitle(t, pending)}</p>
          <div className={styles.pendingActions}>
            <Button
              onClick={() => navigate('session', {
                topicId: pending.topicId,
                levelIndex: pending.level,
                resume: pending,
                resumeId: pending.savedAt,
              })}
            >
              {t('pending_resume')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { if (window.confirm(t('pending_discardConfirm'))) clearPending() }}
            >
              {t('pending_discard')}
            </Button>
          </div>
        </section>
      )}

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
        {groups.map((group) => (
          <div key={group.key} className={styles.group}>
            <h3 className={styles.groupTitle}>{t(`group_${group.key}`)}</h3>
            <div className={styles.track}>
              {group.topics.map((topic) => {
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
          </div>
        ))}
      </section>
    </div>
  )
}

// Sessão por tempo não tem contagem alvo, então mostra o relógio em vez do placar.
function pendingSubtitle(t, pending) {
  const answered = pending.results?.length ?? 0
  const correct = pending.results?.filter(Boolean).length ?? 0
  if (pending.byTime) {
    const left = Math.max(0, (pending.totalMs ?? 0) - (pending.elapsedMs ?? 0))
    const seconds = Math.ceil(left / 1000)
    const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    return t('pending_timeSub', { answered, clock })
  }
  return t('pending_countSub', { answered, total: pending.targetCount ?? answered, correct })
}
