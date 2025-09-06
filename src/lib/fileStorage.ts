// Local file storage for rooms and images
import type { Room } from '../types'

export class LocalFileStorage {
  private static readonly ROOMS_DIR = '/Users/gauthamgururajan/Desktop/Practice/banan/ai-world-explorer/public/data/rooms'
  private static readonly IMAGES_DIR = '/Users/gauthamgururajan/Desktop/Practice/banan/ai-world-explorer/public/generated-rooms'

  // Save room data to local JSON file
  static async saveRoom(room: Room): Promise<void> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('http://localhost:3001/api/save-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to save room: ${response.statusText}`)
      }

      console.log('💾 Room saved to local file:', room.id)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ File storage server timeout on port 3001')
      } else {
        console.error('❌ File storage server not available on port 3001:', error)
      }
      throw error // Let the caller handle fallback to localStorage
    }
  }

  // Load all rooms from local files
  static async loadRooms(): Promise<Room[]> {
    try {
      const response = await fetch('http://localhost:3001/api/load-rooms')
      if (!response.ok) {
        throw new Error(`Failed to load rooms: ${response.statusText}`)
      }

      const rooms: Room[] = await response.json()
      console.log('📂 Loaded rooms from local files:', rooms.length)
      return rooms
    } catch (error) {
      console.error('❌ Failed to load rooms from local files:', error)
      
      // Fallback to localStorage
      const rooms: Room[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('room-')) {
          try {
            const roomData = localStorage.getItem(key)
            if (roomData) {
              rooms.push(JSON.parse(roomData))
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse room from localStorage:', key)
          }
        }
      }
      console.log('📂 Loaded rooms from localStorage as fallback:', rooms.length)
      return rooms
    }
  }

  // Save image to local file system
  static async saveImage(imageData: string, filename: string): Promise<string> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for images
      
      const response = await fetch('http://localhost:3001/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          filename
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to save image: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('💾 Image saved to local file:', result.path)
      return result.path
    } catch (error: any) {
      console.error('❌ Failed to save image to local file:', error)
      // Don't fall back to localStorage for images - they're too big
      throw new Error(`Failed to save image to file storage: ${error.message}. Please ensure the file server is running on port 3001.`)
    }
  }

  // Get image from local file system
  static async getImage(filename: string): Promise<string | null> {
    try {
      const response = await fetch(`/generated-rooms/${filename}`)
      if (!response.ok) {
        throw new Error(`Image not found: ${filename}`)
      }

      // Convert to base64
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('❌ Failed to load image from local file:', error)
      
      // Fallback to localStorage
      const imageData = localStorage.getItem(`image-${filename}`)
      if (imageData) {
        return `data:image/png;base64,${imageData}`
      }
      
      return null
    }
  }

  // Delete room from local file
  static async deleteRoom(roomId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3001/api/delete-room/${roomId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete room: ${response.statusText}`)
      }

      console.log('🗑️ Room deleted from local file:', roomId)
    } catch (error) {
      console.error('❌ Failed to delete room from local file:', error)
      // Fallback to localStorage
      localStorage.removeItem(`room-${roomId}`)
      console.log('🗑️ Room deleted from localStorage as fallback')
    }
  }
}
