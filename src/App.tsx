import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ViewMode } from './types'
import MainLayout from './components/ui/MainLayout'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import WorldEditor from './pages/WorldEditor'
import GameClient from './pages/GameClient'
import WelcomeSplash from './components/ui/WelcomeSplash'

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'generator':
        return <Generator onNavigate={setCurrentView} />
      case 'editor':
        return <WorldEditor onNavigate={setCurrentView} />
      case 'game':
        return <GameClient onNavigate={setCurrentView} />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <AnimatePresence>
        {showSplash ? (
          <WelcomeSplash key="splash" onComplete={handleSplashComplete} />
        ) : (
          <MainLayout currentView={currentView} onNavigate={setCurrentView}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </MainLayout>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
