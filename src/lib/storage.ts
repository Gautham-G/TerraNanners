import type { Room, World } from '../types'
import { LocalFileStorage } from './fileStorage'

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
  ROOMS: 'rooms',
  WORLDS: 'worlds',
  SETTINGS: 'settings',
  CURRENT_WORLD: 'currentWorld'
}

// Room storage functions
export async function saveRoom(room: Room): Promise<void> {
  try {
    // First try to save to file storage (local disk)
    await LocalFileStorage.saveRoom(room)
    console.log('✅ Room saved to local file storage:', room.id)
  } catch (fileError) {
    console.error('❌ Failed to save room to file storage, trying localStorage:', fileError)
    
    // Clear localStorage completely if quota exceeded to make room
    try {
      const rooms = await getRooms()
      const updatedRooms = rooms.filter(r => r.id !== room.id)
      updatedRooms.push(room)
      
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(updatedRooms))
      console.log('✅ Room saved to localStorage as fallback:', room.id)
    } catch (storageError) {
      console.error('❌ localStorage quota exceeded, clearing all storage:', storageError)
      
      // Clear all localStorage and try again with just this room
      localStorage.clear()
      console.log('🗑️ Cleared all localStorage due to quota exceeded')
      
      try {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify([room]))
        console.log('✅ Room saved to cleared localStorage:', room.id)
      } catch (finalError) {
        throw new Error('Storage quota exceeded even after clearing. Room data is too large for localStorage. Please use file storage server.')
      }
    }
  }
}

// Clean up old storage data to free space
function cleanupOldStorageData(): void {
  try {
    // Remove old room images from localStorage (keep data but remove images)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('room-image-')) {
        const timestamp = key.split('-').pop()
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp)
          // Remove images older than 1 hour
          if (age > 60 * 60 * 1000) {
            localStorage.removeItem(key)
            console.log('🗑️ Removed old image from localStorage:', key)
          }
        }
      }
    }
    
    // Also clean up AI World Explorer images storage
    const aiImagesKey = 'ai-world-explorer-images'
    if (localStorage.getItem(aiImagesKey)) {
      try {
        const images = JSON.parse(localStorage.getItem(aiImagesKey) || '{}')
        const cutoffTime = Date.now() - (60 * 60 * 1000) // 1 hour ago
        
        Object.keys(images).forEach(imageId => {
          const imageData = images[imageId]
          if (imageData.timestamp && new Date(imageData.timestamp).getTime() < cutoffTime) {
            delete images[imageId]
          }
        })
        
        localStorage.setItem(aiImagesKey, JSON.stringify(images))
        console.log('🗑️ Cleaned up old AI World Explorer images')
      } catch (e) {
        // If parsing fails, remove the entire key
        localStorage.removeItem(aiImagesKey)
      }
    }
  } catch (error) {
    console.error('Failed to cleanup storage:', error)
  }
}

export async function getRooms(): Promise<Room[]> {
  try {
    return await LocalFileStorage.loadRooms()
  } catch (error) {
    console.error('Failed to load rooms from file storage, using localStorage:', error)
    const roomsJson = localStorage.getItem(STORAGE_KEYS.ROOMS)
    return roomsJson ? JSON.parse(roomsJson) : []
  }
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const rooms = await getRooms()
  return rooms.find(room => room.id === roomId) || null
}

export async function deleteRoom(roomId: string): Promise<void> {
  try {
    await LocalFileStorage.deleteRoom(roomId)
  } catch (error) {
    console.error('Failed to delete room from file storage, using localStorage:', error)
    const rooms = await getRooms()
    const filteredRooms = rooms.filter(room => room.id !== roomId)
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(filteredRooms))
  }
}

// World storage functions
export async function saveWorld(world: World): Promise<void> {
  try {
    // Don't strip image data - keep it simple!
    const worlds = await getWorlds()
    const updatedWorlds = worlds.filter(w => w.id !== world.id)
    updatedWorlds.push(world)
    
    localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(updatedWorlds))
    console.log(`World "${world.name}" saved successfully with ${world.rooms.length} rooms`)
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
      // Clear old data and try again
      console.warn('localStorage quota exceeded, clearing old data...')
      localStorage.clear()
      try {
        localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify([world]))
        console.log('World saved after clearing localStorage')
      } catch (e) {
        throw new Error('Storage quota exceeded even after clearing. Please refresh and try again.')
      }
    } else {
      console.error('Error saving world to localStorage:', error)
      throw new Error(`Failed to save world: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export async function getWorlds(): Promise<World[]> {
  try {
    const worldsJson = localStorage.getItem(STORAGE_KEYS.WORLDS)
    return worldsJson ? JSON.parse(worldsJson) : []
  } catch (error) {
    console.error('Error parsing worlds from localStorage:', error)
    // Clear corrupted data and return empty array
    localStorage.removeItem(STORAGE_KEYS.WORLDS)
    return []
  }
}

export async function getWorld(worldId: string): Promise<World | null> {
  const worlds = await getWorlds()
  return worlds.find(world => world.id === worldId) || null
}

export async function deleteWorld(worldId: string): Promise<void> {
  const worlds = await getWorlds()
  const filteredWorlds = worlds.filter(world => world.id !== worldId)
  localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(filteredWorlds))
}

// Current world functions
export async function setCurrentWorld(worldId: string): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.CURRENT_WORLD, worldId)
}

export async function getCurrentWorld(): Promise<string | null> {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_WORLD)
}

// Utility functions
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function clearAllData(): Promise<void> {
  localStorage.clear()
}

// Export data for backup
export async function exportData(): Promise<string> {
  const rooms = await getRooms()
  const worlds = await getWorlds()
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  
  const exportData = {
    rooms,
    worlds,
    settings: settings ? JSON.parse(settings) : null,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }
  
  return JSON.stringify(exportData, null, 2)
}

// Import data from backup
export async function importData(jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData)
    
    if (data.rooms && Array.isArray(data.rooms)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(data.rooms))
    }
    
    if (data.worlds && Array.isArray(data.worlds)) {
      localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(data.worlds))
    }
    
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
    }
    
    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}