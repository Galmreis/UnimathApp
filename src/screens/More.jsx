import styles from './More.module.css'
import { Icon } from '../components/Icon.jsx'
import { RankBadge } from '../components/RankBadge.jsx'
import { useStore } from '../store/StoreProvider.jsx'

// Tudo que não é o treino do dia fica aqui, pra Home continuar sendo só sobre
// treinar hoje.
export function More({ navigate }) {
  const { t, rank, updateSettings } = useStore()

  const rows = [
    { id: 'papers', icon: 'paper', titleKey: 'more_papers', subKey: 'more_papersSub', go: () => navigate('papers') },
    { id: 'rank', icon: 'rank', titleKey: 'more_rank', subKey: 'more_rankSub', go: () => navigate('rank'), trailing: <RankBadge step={rank.step} size="sm" /> },
    { id: 'help', icon: 'help', titleKey: 'more_help', subKey: 'more_helpSub', go: () => navigate('help') },
    // Replaying the tour is just flipping the flag App watches.
    { id: 'tour', icon: 'replay', titleKey: 'more_tour', subKey: 'more_tourSub', go: () => updateSettings({ onboarded: false }) },
  ]

  return (
    <div className={styles.more}>
      <h1 className={styles.title}>{t('more_title')}</h1>

      <div className={styles.list}>
        {rows.map((row) => (
          <button key={row.id} className={styles.row} onClick={row.go}>
            <span className={styles.rowIcon} aria-hidden><Icon name={row.icon} size={20} /></span>
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>{t(row.titleKey)}</span>
              <span className={styles.rowSub}>{t(row.subKey)}</span>
            </span>
            {row.trailing}
            <span className={styles.chevron} aria-hidden />
          </button>
        ))}
      </div>

      <p className={styles.note}>{t('more_sideNote')}</p>
    </div>
  )
}
