import React, { useState, useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000) // Auto close after 4 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`retro-message ${type}`}>
      <div className="pixel-banana"></div>
      {message}
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          float: 'right',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default Notification
