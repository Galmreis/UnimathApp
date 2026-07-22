import { useState } from 'react'
import styles from './App.module.css'
import { NavBar } from './components/NavBar.jsx'
import { Home } from './screens/Home.jsx'
import { Session } from './screens/Session.jsx'
import { Summary } from './screens/Summary.jsx'
import { Progress } from './screens/Progress.jsx'
import { Settings } from './screens/Settings.jsx'

// The whole app is a single React tree. Instead of a router library we keep the
// current screen in state — `view` is an object like { name: 'session', topicId }.
// `navigate(name, params)` swaps it. Simple, no dependency, and it teaches the
// core React idea: UI is a function of state.
const TAB_VIEWS = ['home', 'progress', 'settings']

export default function App() {
  const [view, setView] = useState({ name: 'home' })
  const navigate = (name, params = {}) => setView({ name, ...params })

  const showNav = TAB_VIEWS.includes(view.name)

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        {view.name === 'home' && <Home navigate={navigate} />}
        {view.name === 'progress' && <Progress />}
        {view.name === 'settings' && <Settings navigate={navigate} />}
        {view.name === 'session' && <Session key={`practice-${view.topicId}`} mode="practice" topicId={view.topicId} navigate={navigate} />}
        {view.name === 'exam' && <Session key={`exam-${view.topicId}`} mode="exam" topicId={view.topicId} navigate={navigate} />}
        {view.name === 'summary' && <Summary result={view.result} navigate={navigate} />}
      </main>

      {showNav && <NavBar active={view.name} onNavigate={navigate} />}
    </div>
  )
}
