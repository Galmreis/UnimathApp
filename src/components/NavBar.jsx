import styles from './NavBar.module.css'
import { Icon } from './Icon.jsx'
import { useStore } from '../store/StoreProvider.jsx'

const TABS = [
  { id: 'home', labelKey: 'nav_home', icon: 'home' },
  { id: 'progress', labelKey: 'nav_progress', icon: 'progress' },
  { id: 'more', labelKey: 'nav_more', icon: 'more' },
  { id: 'settings', labelKey: 'nav_settings', icon: 'settings' },
]

export function NavBar({ active, onNavigate }) {
  const { t } = useStore()
  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={styles.tab}
          data-active={active === tab.id}
          onClick={() => onNavigate(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <Icon name={tab.icon} />
          <span>{t(tab.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}
