import styles from './PageHeader.module.css'
import { Icon } from './Icon.jsx'
import { useStore } from '../store/StoreProvider.jsx'

// Telas secundárias escondem a tab bar, então a seta é a única saída.
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
