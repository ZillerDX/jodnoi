import './lib/installPrompt'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initDb } from './db/db'
import { initUpdateCheck } from './lib/updatePrompt'
import './index.css'

initUpdateCheck()

initDb()
  .catch((err) => console.error('initDb failed', err))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
