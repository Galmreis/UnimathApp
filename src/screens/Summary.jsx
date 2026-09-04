import styles from './Summary.module.css'
import { Button } from '../components/Button.jsx'
import { RankBadge } from '../components/RankBadge.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { TOPICS } from '../data/topics.js'
import { round } from '../lib/math.js'
import { rankLabel, MATCH_UP, MATCH_DOWN } from '../lib/ranks.js'

// Shown after a session, an exam or a rank match. `result` is what Session
// handed us:
//   { mode, topicId, results: boolean[], durationMs, levelIndex?, rank? }
// where `rank` (match only) is { from, to, outcome } — already computed by
// Session with the same pure rules the store used to save it.
export function Summary({ result, navigate }) {
  const { t, getTopic } = useStore()
  const topic = result.topicId ? getTopic(result.topicId) : null
  const total = result.results.length
  const correct = result.results.filter(Boolean).length
  const pct = total > 0 ? round((correct / total) * 100, 0) : 0
  const isExam = result.mode === 'exam'
  const isMatch = result.mode === 'match'

  return (
    <div className={styles.summary}>
      <div className={styles.hero}>
        <div className={styles.pct}>{pct}%</div>
        <div className={styles.score}>{t('ofCorrect', { correct, total })}</div>
        <div className={styles.sub}>
          {isMatch ? t('rank_matchTag') : topic.name} · {formatDuration(result.durationMs)}
        </div>
        {isMatch && (
          <div className={styles.rankRow}>
            <RankBadge step={result.rank.to} size="lg" />
          </div>
        )}
      </div>

      <p className={styles.message}>
        {isMatch
          ? matchMessage(t, result.rank, correct, total)
          : isExam
            ? examMessage(t, correct, total, result.levelIndex, topic)
            : practiceMessage(t, pct)}
      </p>

      <div className={styles.actions}>
        {isMatch ? (
          <>
            <Button size="big" full onClick={() => navigate('rank', { from: 'home' })}>{t('rank_title')}</Button>
            <Button variant="ghost" full onClick={() => navigate('home')}>{t('backHome')}</Button>
          </>
        ) : (
          <>
            <Button size="big" full onClick={() => navigate(isExam ? 'exam' : 'session', { topicId: result.topicId })}>
              {isExam ? t('retakeExam') : t('trainAgain')}
            </Button>
            <Button variant="ghost" full onClick={() => navigate('home')}>{t('backHome')}</Button>
          </>
        )}
      </div>
    </div>
  )
}

// Short, guilt-free encouragement based on how the practice went.
function practiceMessage(t, pct) {
  if (pct >= 90) return t('practice90')
  if (pct >= 70) return t('practice70')
  if (pct >= 50) return t('practice50')
  return t('practice0')
}

// Explains what the exam did to your level (mirrors applyExamResult's rule).
function examMessage(t, correct, total, levelIndex, topic) {
  const ratio = correct / total
  const atLastLevel = levelIndex >= topic.levels.length - 1
  const isLastTopic = TOPICS[TOPICS.length - 1].id === topic.id
  if (ratio >= 0.8) {
    if (!atLastLevel) return t('examUp')
    return isLastTopic ? t('examMasteredAll', { topic: topic.name }) : t('examMastered', { topic: topic.name })
  }
  if (ratio < 0.5 && levelIndex > 0) {
    return t('examDown')
  }
  return t('examStay')
}

// Explains what the rank match did to your step (mirrors applyMatchResult).
// "Stay" covers three different stories, and they don't read the same: a win
// with nowhere left to climb, a loss with nowhere left to fall, and the ordinary
// middle score that simply holds the step.
function matchMessage(t, rank, correct, total) {
  const label = rankLabel(rank.to, t)
  if (rank.outcome === 'up') return t('rank_promoted', { rank: label })
  if (rank.outcome === 'down') return t('rank_demoted', { rank: label })
  const ratio = total > 0 ? correct / total : 0
  if (ratio >= MATCH_UP) return t('rank_atTop', { rank: label })
  if (ratio < MATCH_DOWN) return t('rank_atBottom', { rank: label })
  return t('rank_kept', { rank: label })
}

// Milliseconds -> "3 min" or "45 s".
function formatDuration(ms) {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds} s`
  return `${Math.round(seconds / 60)} min`
}
