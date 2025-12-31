import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App'
import { FreighterProvider } from './contexts/FreighterContext'
import { NetworkProvider } from './contexts/NetworkContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { TutorialProvider } from './contexts/TutorialContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NetworkProvider>
        <FreighterProvider>
          <NotificationProvider>
            <TutorialProvider>
              <App />
            </TutorialProvider>
          </NotificationProvider>
        </FreighterProvider>
      </NetworkProvider>
    </ThemeProvider>
  </StrictMode>,
)
