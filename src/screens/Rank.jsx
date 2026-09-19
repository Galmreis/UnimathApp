import styles from './Rank.module.css'
import { Button } from '../components/Button.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { RankBadge } from '../components/RankBadge.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import {
  RANK_TIERS, RANK_STEPS, rankAt, rankLabel, roman, tierStartStep, MATCH_QUESTIONS,
} from '../lib/ranks.js'

// Tudo aqui sai de rank.step. Como a única forma de mexer nesse número é o teste
// de pareamento, a tela é basicamente explicação mais um botão.
export function Rank({ from, navigate }) {
  const { t, rank } = useStore()
  const current = rankAt(rank.step)

  return (
    <div className={styles.rank}>
      <PageHeader title={t('rank_title')} onBack={() => navigate(from ?? 'more')} />

      <section className={styles.hero}>
        <RankBadge step={rank.step} size="lg" />
        <div className={styles.heroMeta}>{t('rank_stepOf', { n: rank.step + 1, m: RANK_STEPS })}</div>
        <ProgressBar value={(rank.step + 1) / RANK_STEPS} tone={current.isTop ? 'success' : 'accent'} />
      </section>

      <section className={styles.cta}>
        <Button size="big" full onClick={() => navigate('match', { matchId: Date.now() })}>
          {t('rank_matchCta')}
        </Button>
        <p className={styles.ctaNote}>{t('rank_matchNote')}</p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('rank_ladder')}</h2>
        <div className={styles.ladder}>
          {RANK_TIERS.map((tier, tierIndex) => {
            const start = tierStartStep(tierIndex)
            const isCurrentTier = tierIndex === current.tierIndex
            return (
              <div key={tier.key} className={styles.tier} data-current={isCurrentTier}>
                <span className={styles.tierName} style={{ color: isCurrentTier ? tier.color : undefined }}>
                  {t(`rank_${tier.key}`)}
                </span>
                <span className={styles.pips}>
                  {Array.from({ length: tier.divisions }, (_, i) => {
                    const step = start + i
                    const state = step === rank.step ? 'current' : step < rank.step ? 'done' : 'todo'
                    return (
                      <span
                        key={i}
                        className={styles.pip}
                        data-state={state}
                        style={state !== 'todo' ? { color: tier.color, borderColor: `${tier.color}88`, backgroundColor: `${tier.color}22` } : undefined}
                      >
                        {roman(i + 1)}
                      </span>
                    )
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.rules}>
        <h2 className={styles.sectionTitle}>{t('rank_rules_t')}</h2>
        <p className={styles.ruleLine}>{t('rank_rules_p', { n: MATCH_QUESTIONS })}</p>
        <p className={styles.ruleLine}>{t('rank_rules_p2')}</p>
        <p className={styles.ruleLine}>{t('rank_rules_p3')}</p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('rank_history')}</h2>
        {rank.matches.length === 0 ? (
          <p className={styles.empty}>{t('rank_noHistory')}</p>
        ) : (
          <ul className={styles.history}>
            {rank.matches.slice(0, 8).map((match, i) => (
              <li key={i} className={styles.historyRow}>
                <span className={styles.historyWhen}>
                  {formatDate(match.date)} · {rankLabel(match.to, t)}
                </span>
                <span className={styles.historyScore} data-outcome={match.outcome}>
                  {match.correct}/{match.total} · {t(`rank_res_${match.outcome}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// "2026-07-22" -> "22/07"
function formatDate(iso) {
  const [, month, day] = String(iso).split('-')
  return `${day}/${month}`
}
