import styles from './NavBar.module.css'
import { Icon } from './Icon.jsx'

// The bottom tab bar (mobile-first). Three destinations; the active one is
// highlighted. This is our navigation instead of a router — simple state.
const TABS = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'progress', label: 'Progresso', icon: 'progress' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
]

export function NavBar({ active, onNavigate }) {
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
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
