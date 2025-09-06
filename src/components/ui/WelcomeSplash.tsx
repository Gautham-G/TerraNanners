import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomeSplashProps {
  onComplete: () => void
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState(0)
  
  const welcomeTexts = [
    "🍌 Welcome to PokéBanana!",
    "⚡ Powered by Gemini Nano",
    "🎮 Let's go bananas!"
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentText < welcomeTexts.length - 1) {
        setCurrentText(currentText + 1)
      } else {
        setTimeout(onComplete, 1000)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentText, onComplete, welcomeTexts.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-yellow-900/20 flex items-center justify-center z-50"
    >
      <div className="text-center">
        {/* Animated Banana */}
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-8xl mb-8"
        >
          🍌
        </motion.div>

        {/* Welcome Text */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-4 glow-text"
          >
            {welcomeTexts[currentText]}
          </motion.h1>
        </AnimatePresence>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                backgroundColor: ["#FCD34D", "#60A5FA", "#A855F7", "#FCD34D"]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-yellow-400"
            />
          ))}
        </div>

        {/* Hackathon Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-400 text-sm mt-8"
        >
          Made for Google Nano Banana Hackathon
        </motion.p>
      </div>
    </motion.div>
  )
}

export default WelcomeSplash
