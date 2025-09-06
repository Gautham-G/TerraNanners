import React from 'react'
import { motion } from 'framer-motion'
import type { ViewMode } from '../../types'
import BananaFooter from './BananaFooter'

interface MainLayoutProps {
  children: React.ReactNode
  currentView: ViewMode
  onNavigate: (view: ViewMode) => void
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, onNavigate }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'generator', label: 'Generator', icon: '✨' },
    { id: 'editor', label: 'World Editor', icon: '🗺️' },
    { id: 'game', label: 'Play Game', icon: '🎮' },
  ]

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar Navigation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 p-4"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-yellow-400 retro-text">🍌 TerraNanners</h1>
          <p className="text-yellow-300 text-sm mt-1 retro-subtext">Create • Build • Explore 🎮</p>
        </motion.div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => onNavigate(item.id as ViewMode)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 retro-button ${
                currentView === item.id
                  ? 'bg-yellow-400 text-black font-bold border-2 border-yellow-300 shadow-retro-active retro-button-active'
                  : 'bg-gray-800 text-yellow-300 border-2 border-yellow-400/30 hover:bg-yellow-400/10 hover:border-yellow-400 shadow-retro retro-button-inactive'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Status Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>🤖 AI Ready</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-16 bg-gray-900/30 backdrop-blur-sm border-b border-gray-700 px-6 flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold capitalize">{currentView}</h2>
            <p className="text-gray-400 text-sm">
              {currentView === 'dashboard' && 'Manage your worlds and rooms'}
              {currentView === 'generator' && 'Generate new rooms with AI'}
              {currentView === 'editor' && 'Build and connect your world'}
              {currentView === 'game' && 'Explore your created worlds'}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              title="Settings"
            >
              ⚙️
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              title="Help"
            >
              ❓
            </motion.button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 flex flex-col">
          {children}
          <BananaFooter />
        </main>
      </div>
    </div>
  )
}

export default MainLayout