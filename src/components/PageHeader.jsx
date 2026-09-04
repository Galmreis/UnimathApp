import styles from './PageHeader.module.css'
import { Icon } from './Icon.jsx'
import { useStore } from '../store/StoreProvider.jsx'

// The header of a secondary screen (Como funciona, Ranking, Provas): a back
// arrow, the title, and an optional line of intro text under it. These screens
// are reached from "Mais" and hide the tab bar, so the arrow is the way out.
export function PageHeader({ title, intro, onBack }) {
  const { t } = useStore()
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <button className={styles.back} onClick={onBack} aria-label={t('backHome')}>
          <Icon name="back" size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      {intro && <p className={styles.intro}>{intro}</p>}
    </header>
  )
}
