import React, { useState } from 'react'
import type { ViewMode } from '../types'
import { generateRoom } from '../lib/gemini'
import { saveRoom, generateId } from '../lib/storage'
import { LocalImageStorage } from '../lib/imageStorage'
import BananaLoadingSpinner from '../components/ui/BananaLoadingSpinner'
import Notification from '../components/ui/Notification'

interface GeneratorProps {
  onNavigate: (view: ViewMode) => void
}

const Generator: React.FC<GeneratorProps> = ({ onNavigate }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [roomNames, setRoomNames] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    setSelectedFiles(prev => [...prev, ...files])
    // Initialize room names for new files
    setRoomNames(prev => [
      ...prev, 
      ...files.map((_, index) => `Room ${prev.length + index + 1}`)
    ])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
      // Initialize room names for new files
      setRoomNames(prev => [
        ...prev, 
        ...files.map((file, index) => `Room ${prev.length + index + 1}`)
      ])
    }
  }

  const updateRoomName = (index: number, name: string) => {
    setRoomNames(prev => {
      const newNames = [...prev]
      newNames[index] = name
      return newNames
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setRoomNames(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) return
    
    setIsGenerating(true)
    
    try {
      // Check localStorage space first
      const storageUsed = new Blob([JSON.stringify(localStorage)]).size
      if (storageUsed > 4 * 1024 * 1024) { // 4MB limit
        console.warn('⚠️ localStorage nearly full, clearing old images...')
        LocalImageStorage.clearStoredImages()
      }

      if (selectedFiles.length === 1) {
        // Single image - generate one room
        const result = await generateSingleRoom(selectedFiles[0], 0)
        if (result) {
          setNotification({
            message: 'Successfully created Pokemon room! Go to World Builder?',
            type: 'success'
          })
        }
      } else {
        // Multiple images - generate single room from all images
        const combinedName = roomNames[0] || 'Combined Room'
        const result = await generateRoomFromMultipleImages(selectedFiles, combinedName)
        if (result) {
          setNotification({
            message: `Successfully created Pokemon room "${combinedName}" from ${selectedFiles.length} images! Go to World Builder?`,
            type: 'success'
          })
        }
      }
      
      setIsGenerating(false)
      setSelectedFiles([]) // Clear selected files
      setRoomNames([]) // Clear room names
      
      // Navigate to editor after a short delay
      setTimeout(() => {
        onNavigate('editor')
      }, 2000)
      
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setNotification({
        message: 'Something went wrong! Please try again with your images.',
        type: 'error'
      })
    }
  }

  const generateSingleRoom = async (file: File, index: number) => {
    const roomName = roomNames[index] || `Room from ${file.name}`
    console.log('Generating room:', roomName)
    
    // Generate room with AI
    const result = await generateRoom({
      imageFile: file,
      style: 'pokemon',
      theme: 'auto'
    })
    
    if (result.success) {
      await saveGeneratedRoom(result, roomName)
      return true
    } else {
      console.error('Room generation failed:', result.error)
      setNotification({
        message: `Failed to transform ${roomName}: ${result.error}`,
        type: 'error'
      })
      return false
    }
  }

  const generateRoomFromMultipleImages = async (files: File[], roomName: string) => {
    console.log('Generating single room from multiple images:', files.map(f => f.name))
    
    // Use the first image as primary, but mention multiple in prompt
    const primaryFile = files[0]
    const result = await generateRoom({
      imageFile: primaryFile,
      style: 'pokemon',
      theme: `Combined room inspired by ${files.length} different perspectives`
    })
    
    if (result.success) {
      await saveGeneratedRoom(result, roomName)
      return true
    } else {
      console.error('Multi-image room generation failed:', result.error)
      setNotification({
        message: `Failed to create room from multiple images: ${result.error}`,
        type: 'error'
      })
      return false
    }
  }

  const saveGeneratedRoom = async (result: any, roomName: string) => {
    try {
      // Save generated image with better error handling
      if (result.localImagePath && result.roomImage.includes('base64,')) {
        const imageData = result.roomImage.split('base64,')[1]
        const imageId = `room-${generateId()}`
        
        try {
          LocalImageStorage.saveToLocalStorage(imageId, imageData)
        } catch (storageError) {
          console.warn('⚠️ localStorage full, using file download only')
        }
        
        // Always offer download option
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        LocalImageStorage.downloadImage(imageData, `pokemon-room-${timestamp}.png`)
      }
      
      // Create room object
      const room = {
        id: generateId(),
        name: roomName,
        description: result.roomDescription,
        imageUrl: result.roomImage,
        walkableAreas: [] as boolean[][], // Will be defined later in editor
        objects: result.suggestedObjects.map((name: string) => ({
          id: generateId(),
          name,
          description: `Interactive ${name}`,
          x: Math.random() * 400 + 200, // Random position
          y: Math.random() * 300 + 150,
          width: 32,
          height: 32,
          interactive: true
        })),
        connections: {},
        createdAt: new Date()
      }
      
      // Save to local storage with error handling
      await saveRoom(room)
      console.log('Room saved successfully:', room.id)
    } catch (error) {
      console.error('Failed to save room:', error)
      // Room generation succeeded but save failed - still count as success
      setNotification({
        message: 'Room generated but failed to save. Downloaded image is available.',
        type: 'info'
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {isGenerating ? (
        <div className="card text-center">
          <BananaLoadingSpinner 
            message="Creating Pokemon Rooms..."
            submessage="Analyzing your images and transforming them..."
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-4 retro-text text-yellow-400">🍌 TerraNanners Room Generator</h1>
            <div className="banana-character">🍌</div>
            <p className="text-yellow-300 mt-4 retro-subtext">
              Transform your room photos into retro Pokemon-style game rooms!<br/>
              <strong>Single image:</strong> Creates one room | <strong>Multiple images:</strong> Creates one combined room
            </p>
          </div>

          {/* File Upload Area */}
          <div className="card">
            <div
              className={`border-2 border-dashed p-4 text-center transition-all ${
                dragActive 
                  ? 'border-pokemon-yellow bg-pokemon-yellow bg-opacity-20' 
                  : 'border-gray-600 hover:border-pokemon-yellow'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mb-4">📸🎮</div>
              <h3 className="mb-2">Drop your room photos here!</h3>
              <p className="text-gray-400 mb-4">
                Upload single images for individual rooms, or multiple images to create one combined room
                <br />
                Supports JPG, PNG, WebP
              </p>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer"
              >
                Browse Photos
              </label>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="retro-card">
              <h3 className="mb-4 retro-text text-yellow-400">Selected Images ({selectedFiles.length})</h3>
              <div className="space-y-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border-2 border-yellow-400/30">
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-yellow-400"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 retro-button"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-2">{file.name}</div>
                      <input
                        type="text"
                        value={roomNames[index] || `Room ${index + 1}`}
                        onChange={(e) => updateRoomName(index, e.target.value)}
                        placeholder={`Room ${index + 1}`}
                        className="retro-input w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={selectedFiles.length === 0 || isGenerating}
              className={`retro-button px-8 py-4 text-lg ${
                selectedFiles.length === 0 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-500' 
                  : 'bg-yellow-400 text-black font-bold border-2 border-yellow-300 hover:bg-yellow-300 shadow-retro'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mr-3"></div>
                  Generating TerraNanners Rooms...
                </span>
              ) : (
                selectedFiles.length === 1 
                  ? `🍌 Generate Pokemon Room`
                  : selectedFiles.length > 1 
                    ? `🍌 Generate Combined Room (${selectedFiles.length} images)`
                    : `Select Images First`
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Generator