import React from 'react'

const BananaFooter: React.FC = () => {
  return (
    <footer className="mt-auto py-6 border-t border-gray-700/50 text-center">
      <div className="space-y-2">
        <div className="inline-block pixel-banana">
          🍌
        </div>
        <p className="text-gray-400 text-sm retro-text">
          Made with 🍌 and ⚡ for{' '}
          <span className="text-yellow-400 font-semibold">Google Nano Banana Hackathon</span>
        </p>
        <p className="text-gray-500 text-xs retro-text">
          Powered by Gemini Nano Banana • Going bananas since 2025
        </p>
      </div>
    </footer>
  )
}

export default BananaFooter
