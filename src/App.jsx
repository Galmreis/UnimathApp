import { useState } from 'react'
import styles from './App.module.css'
import { NavBar } from './components/NavBar.jsx'
import { useStore } from './store/StoreProvider.jsx'
import { useScrollMemory } from './store/useScrollMemory.js'
import { Home } from './screens/Home.jsx'
import { Session } from './screens/Session.jsx'
import { Summary } from './screens/Summary.jsx'
import { Progress } from './screens/Progress.jsx'
import { Settings } from './screens/Settings.jsx'
import { More } from './screens/More.jsx'
import { Help } from './screens/Help.jsx'
import { Rank } from './screens/Rank.jsx'
import { Papers } from './screens/Papers.jsx'
import { PaperRun } from './screens/PaperRun.jsx'
import { Onboarding } from './screens/Onboarding.jsx'

// The whole app is a single React tree. Instead of a router library we keep the
// current screen in state — `view` is an object like { name: 'session', topicId }.
// `navigate(name, params)` swaps it. Simple, no dependency, and it teaches the
// core React idea: UI is a function of state.
//
// The four names in TAB_VIEWS are the ones the bottom tab bar shows. Everything
// else (a session, the summary, a rank match) is a full-screen flow that hides
// the bar so the user has one obvious way out.
const TAB_VIEWS = ['home', 'progress', 'more', 'settings']

export default function App() {
  const { settings, updateSettings } = useStore()
  const [view, setView] = useState({ name: 'home' })
  // Remembers where each screen was scrolled — see store/useScrollMemory.js.
  const rememberScroll = useScrollMemory(view.name)

  function navigate(name, params = {}) {
    rememberScroll(name) // must run before the state change, while the old screen is still up
    setView({ name, ...params })
  }

  // First run: the tour owns the screen until it's done (or skipped). Ajustes ›
  // "Ver o tour de novo" flips the flag back to replay it.
  if (!settings.onboarded) {
    return <Onboarding onDone={() => updateSettings({ onboarded: true })} />
  }

  const showNav = TAB_VIEWS.includes(view.name)

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        {view.name === 'home' && <Home navigate={navigate} />}
        {view.name === 'progress' && <Progress />}
        {view.name === 'more' && <More navigate={navigate} />}
        {view.name === 'settings' && <Settings navigate={navigate} />}
        {view.name === 'help' && <Help from={view.from} navigate={navigate} />}
        {view.name === 'rank' && <Rank from={view.from} navigate={navigate} />}
        {view.name === 'papers' && <Papers navigate={navigate} />}
        {view.name === 'paperRun' && <PaperRun key={`run-${view.runId}`} setup={view.setup} navigate={navigate} />}
        {view.name === 'session' && <Session key={`practice-${view.topicId}-${view.levelIndex ?? 'cur'}-${view.resumeId ?? 'new'}`} mode="practice" topicId={view.topicId} levelIndex={view.levelIndex} resume={view.resume} navigate={navigate} />}
        {view.name === 'exam' && <Session key={`exam-${view.topicId}`} mode="exam" topicId={view.topicId} navigate={navigate} />}
        {view.name === 'match' && <Session key={`match-${view.matchId}`} mode="match" navigate={navigate} />}
        {view.name === 'summary' && <Summary result={view.result} navigate={navigate} />}
      </main>

      {showNav && <NavBar active={view.name} onNavigate={navigate} />}
    </div>
  )
}
