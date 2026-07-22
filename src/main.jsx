import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoreProvider } from './store/StoreProvider.jsx'
import App from './App.jsx'
import './index.css'

// The single entry point. React renders <App/> into the <div id="root"> from
// index.html. <StoreProvider> wraps everything so any screen can read the store.
// <StrictMode> is a dev-only helper that flags unsafe patterns early.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
