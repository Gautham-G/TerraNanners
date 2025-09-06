import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ViewMode } from '../types'
import { getRooms } from '../lib/storage'
import type { Room } from '../types'
import { testGeminiConnection } from '../lib/gemini'

interface DashboardProps {
  onNavigate: (view: ViewMode) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [apiTesting, setApiTesting] = useState(false)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown')

  const testGeminiAPI = async () => {
    setApiTesting(true)
    try {
      console.log('🧪 Testing Gemini API connection...')
      const isWorking = await testGeminiConnection()
      setApiStatus(isWorking ? 'working' : 'error')
      
      if (isWorking) {
        alert('🎉 Gemini API is working perfectly! Ready to generate rooms.')
      } else {
        alert('❌ Gemini API test failed. Please check your API key.')
      }
    } catch (error) {
      console.error('API test error:', error)
      setApiStatus('error')
      alert('❌ API test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setApiTesting(false)
    }
  }

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const savedRooms = await getRooms()
        setRooms(savedRooms)
        console.log('Dashboard loaded rooms:', savedRooms.length)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRooms()
    
    // Refresh rooms every 2 seconds to catch newly generated rooms
    const interval = setInterval(loadRooms, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="mb-6"
        >
          <div className="text-6xl mb-4 animate-float">🎮⚡</div>
          <h1 className="text-4xl font-bold glow-text mb-4">AI World Explorer</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your photos into explorable Pokémon-style worlds powered by Google's Gemini AI. 
            Create, connect, and explore pixel-perfect adventures!
          </p>
        </motion.div>

        {/* Quick Start Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => onNavigate('generator')}
            className="btn-primary text-lg"
          >
            ✨ Generate First Room
          </button>
          <button
            onClick={() => onNavigate('editor')}
            className="btn-secondary text-lg"
          >
            🗺️ Build World
          </button>
          <button
            onClick={testGeminiAPI}
            disabled={apiTesting}
            className={`btn-primary text-lg ${
              apiStatus === 'working' 
                ? 'bg-pokemon-green border-pokemon-green' 
                : apiStatus === 'error'
                ? 'bg-pokemon-red border-pokemon-red'
                : ''
            }`}
          >
            {apiTesting ? '🔄 Testing...' : '🧪 Test AI'}
          </button>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(0, 212, 255, 0.1)' }}
          className="card"
        >
          <div className="text-3xl mb-4 animate-spin-banana">🎨</div>
          <h3 className="text-xl font-semibold mb-2 text-neon-blue">AI Generation</h3>
          <p className="text-gray-400">
            Upload your photos and watch as Gemini AI transforms them into beautiful, 
            top-down game rooms with pixel-perfect Pokémon aesthetics. Powered by cutting-edge AI!
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(255, 0, 170, 0.1)' }}
          className="card"
        >
          <div className="text-3xl mb-4 animate-float">🏗️</div>
          <h3 className="text-xl font-semibold mb-2 text-neon-pink">World Building</h3>
          <p className="text-gray-400">
            Connect your generated rooms together to create vast, interconnected worlds! 
            Design the layout and flow of your adventure.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(57, 255, 20, 0.1)' }}
          className="card"
        >
          <div className="text-3xl mb-4 animate-spin-banana">🎮</div>
          <h3 className="text-xl font-semibold mb-2 text-neon-green">🍌 Banana Exploration</h3>
          <p className="text-gray-400">
            Step into your created banana-worlds and explore them in real-time! 
            Interact with objects, catch Pokémon, and discover banana-themed treasures within.
          </p>
        </motion.div>
      </motion.div>

      {/* Generated Rooms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-xl font-semibold mb-4">Your Generated Rooms ({rooms.length})</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p>No rooms generated yet. Start by creating your first room!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.slice(0, 6).map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => onNavigate('editor')}
              >
                <div className="aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden">
                  {room.imageUrl ? (
                    <img 
                      src={room.imageUrl} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🏠
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-sm truncate mb-1">{room.name}</h4>
                <p className="text-xs text-gray-400 line-clamp-2">{room.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {room.objects.length} objects • {new Date(room.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {rooms.length > 6 && (
          <div className="text-center mt-4">
            <button 
              onClick={() => onNavigate('editor')}
              className="btn-secondary text-sm"
            >
              View All Rooms
            </button>
          </div>
        )}
      </motion.div>

      {/* Helpful Tips for First-time Users */}
      {rooms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="card"
        >
          <h3 className="text-xl font-semibold mb-4">🍌 Getting Started with PokéBanana</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-400/10 rounded-lg">
              <div className="text-2xl mb-2">📸</div>
              <h4 className="font-semibold text-yellow-400 mb-1">1. Take Photos</h4>
              <p className="text-sm text-gray-400">
                Photos of your bedroom, kitchen, office, or any room work great!
              </p>
            </div>
            <div className="text-center p-4 bg-blue-400/10 rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-semibold text-blue-400 mb-1">2. AI Transform</h4>
              <p className="text-sm text-gray-400">
                Our banana-powered AI will turn them into Pokémon-style rooms!
              </p>
            </div>
            <div className="text-center p-4 bg-green-400/10 rounded-lg">
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="font-semibold text-green-400 mb-1">3. Play & Explore</h4>
              <p className="text-sm text-gray-400">
                Connect rooms and explore your tropical Pokémon adventure!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard