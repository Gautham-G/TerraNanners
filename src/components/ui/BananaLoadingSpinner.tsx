import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  submessage?: string
}

export const BananaLoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Generating...", 
  submessage = "This may take a moment" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Retro Banana */}
      <div className="text-4xl mb-4 pixel-banana">
        🍌
      </div>
      
      {/* Simple Loading Animation */}
      <div className="w-16 h-4 border-2 border-pokemon-border bg-pokemon-dark rounded mb-4">
        <div className="h-full bg-pokemon-yellow animate-pulse rounded-sm"></div>
      </div>
      
      {/* Text */}
      <h3 className="text-pokemon-yellow mb-2 text-center">
        {message}
      </h3>
      
      <p className="text-gray-400 text-sm text-center max-w-xs">
        {submessage}
      </p>
      
      {/* Simple dots animation */}
      <div className="flex space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-pokemon-yellow animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default BananaLoadingSpinner
