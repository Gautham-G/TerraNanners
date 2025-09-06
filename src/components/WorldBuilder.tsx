import React, { useState, useEffect } from 'react'
import type { ViewMode, Room, World } from '../types'
import { getRooms, saveWorld, getWorlds } from '../lib/storage'
import Notification from '../components/ui/Notification'

interface WorldBuilderProps {
  onNavigate: (view: ViewMode) => void
}

interface GridRoom {
  id: string
  room: Room | null
  x: number
  y: number
}

const WorldBuilder: React.FC<WorldBuilderProps> = ({ onNavigate }) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [worldGrid, setWorldGrid] = useState<GridRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [worldName, setWorldName] = useState('')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const GRID_SIZE = 5

  useEffect(() => {
    loadRooms()
    initializeGrid()
  }, [])

  const loadRooms = async () => {
    try {
      const savedRooms = await getRooms()
      setRooms(savedRooms)
    } catch (error) {
      console.error('Failed to load rooms:', error)
    }
  }

  const initializeGrid = () => {
    const grid: GridRoom[] = []
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push({
          id: `${x}-${y}`,
          room: null,
          x,
          y
        })
      }
    }
    setWorldGrid(grid)
  }

  const placeRoomInGrid = (gridX: number, gridY: number) => {
    if (!selectedRoom) {
      setNotification({
        message: 'Select a room first!',
        type: 'error'
      })
      return
    }

    const newGrid = worldGrid.map(cell => {
      if (cell.x === gridX && cell.y === gridY) {
        return { ...cell, room: selectedRoom }
      }
      return cell
    })

    setWorldGrid(newGrid)
    setSelectedRoom(null)
    setNotification({
      message: 'Room placed successfully!',
      type: 'success'
    })
  }

  const removeRoomFromGrid = (gridX: number, gridY: number) => {
    const newGrid = worldGrid.map(cell => {
      if (cell.x === gridX && cell.y === gridY) {
        return { ...cell, room: null }
      }
      return cell
    })
    setWorldGrid(newGrid)
  }

  const handleSaveWorld = async () => {
    if (!worldName.trim()) {
      setNotification({
        message: 'Please enter a world name!',
        type: 'error'
      })
      return
    }

    const roomsInWorld = worldGrid.filter(cell => cell.room !== null)
    if (roomsInWorld.length === 0) {
      setNotification({
        message: 'Add at least one room to your world!',
        type: 'error'
      })
      return
    }

    try {
      console.log('🚀 Starting world save process...')
      console.log('📊 World data:', {
        name: worldName,
        roomCount: roomsInWorld.length,
        gridSize: GRID_SIZE
      })

      const roomsInWorldGrid = roomsInWorld.map(cell => cell.room!)
      
      // Validate rooms have required properties
      for (const room of roomsInWorldGrid) {
        if (!room.id || !room.name) {
          throw new Error(`Invalid room data: missing id or name`)
        }
      }
      
      const world: World = {
        id: `world-${Date.now()}`,
        name: worldName,
        rooms: roomsInWorldGrid,
        layout: {
          grid: Array(GRID_SIZE).fill(null).map((_, y) => 
            Array(GRID_SIZE).fill(null).map((_, x) => {
              const cell = worldGrid.find(c => c.x === x && c.y === y)
              return cell?.room?.id || null
            })
          ),
          gridSize: { width: GRID_SIZE, height: GRID_SIZE }
        },
        startingRoomId: roomsInWorldGrid[0].id,
        createdAt: new Date()
      }

      console.log('💾 Attempting to save world:', world.id)
      console.log('📈 World object size:', JSON.stringify(world).length, 'characters')

      await saveWorld(world)
      
      console.log('✅ World saved successfully!')
      setNotification({
        message: `World "${worldName}" saved successfully! You can now play it!`,
        type: 'success'
      })
      
      // Clear the grid and name for next world
      setWorldName('')
      initializeGrid()
    } catch (error) {
      console.error('❌ Error saving world:', error)
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      setNotification({
        message: `Failed to save world: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="mb-4 retro-text text-yellow-400">🍌 TerraNanners World Builder</h1>
        <div className="banana-character">🍌</div>
        <p className="text-yellow-300 mt-4 retro-subtext">
          Arrange your generated rooms to create an interconnected Pokemon world!
        </p>
      </div>

      {/* World Name Input */}
      <div className="retro-card">
        <h2 className="mb-4 retro-text text-yellow-400">World Name</h2>
        <input
          type="text"
          value={worldName}
          onChange={(e) => setWorldName(e.target.value)}
          placeholder="Enter your world name..."
          className="retro-input w-full max-w-md"
        />
      </div>

      {/* Available Rooms */}
      <div className="retro-card">
        <h2 className="mb-4 retro-text text-yellow-400">Available Rooms ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <div className="text-center text-yellow-300">
            <p className="retro-subtext">No rooms available. Generate some rooms first!</p>
            <button 
              onClick={() => onNavigate('generator')}
              className="retro-button bg-yellow-400 text-black font-bold border-2 border-yellow-300 px-6 py-3 mt-4"
            >
              🍌 Generate Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`relative cursor-pointer transition-all retro-button ${
                  selectedRoom?.id === room.id 
                    ? 'bg-yellow-400 text-black border-2 border-yellow-300 shadow-retro-active' 
                    : 'bg-gray-800 text-yellow-300 border-2 border-yellow-400/30 hover:bg-yellow-400/10 hover:border-yellow-400 shadow-retro'
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="p-3">
                  {room.imageUrl && (
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-20 object-cover rounded mb-2 border-2 border-current"
                    />
                  )}
                  <div className="text-center">
                    <div className="text-xs font-bold mb-1 retro-subtext">
                      {room.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {room.objects?.length || 0} objects
                    </div>
                  </div>
                </div>
                {selectedRoom?.id === room.id && (
                  <div className="absolute -top-2 -right-2 bg-pokemon-yellow text-pokemon-dark rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* World Grid */}
      <div className="card">
        <h2 className="mb-4">World Layout</h2>
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
          {worldGrid.map((cell) => (
            <div
              key={cell.id}
              className={`aspect-square border-2 cursor-pointer transition-all ${
                cell.room 
                  ? 'bg-pokemon-blue border-pokemon-yellow shadow-lg' 
                  : 'bg-pokemon-dark border-pokemon-border hover:bg-pokemon-border hover:border-pokemon-yellow'
              }`}
              onClick={() => {
                if (cell.room) {
                  // Right click or special action to remove
                  if (window.confirm('Remove this room from the grid?')) {
                    removeRoomFromGrid(cell.x, cell.y)
                  }
                } else {
                  placeRoomInGrid(cell.x, cell.y)
                }
              }}
            >
              {cell.room ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-xs text-center text-white font-bold">
                    🏠
                  </div>
                  <div className="text-xs text-center text-white">
                    {cell.room.name.substring(0, 6)}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  +
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-gray-400 text-xs">
          {selectedRoom ? 'Click an empty cell to place the selected room' : 'Select a room from above first'}
        </div>
      </div>

      {/* Controls */}
      <div className="text-center space-x-4">
        <button 
          onClick={() => onNavigate('generator')}
          className="retro-button bg-gray-800 text-yellow-300 border-2 border-yellow-400/30 px-6 py-3"
        >
          🍌 Add More Rooms
        </button>
        <button 
          onClick={handleSaveWorld}
          disabled={!worldName.trim() || worldGrid.filter(cell => cell.room).length === 0}
          className={`retro-button px-6 py-3 ${
            !worldName.trim() || worldGrid.filter(cell => cell.room).length === 0
              ? 'bg-gray-600 text-gray-400 border-2 border-gray-500 cursor-not-allowed'
              : 'bg-yellow-400 text-black font-bold border-2 border-yellow-300 shadow-retro'
          }`}
        >
          💾 Save World
        </button>
        <button 
          onClick={() => onNavigate('game')}
          className="retro-button bg-green-600 text-white border-2 border-green-400 px-6 py-3"
        >
          🎮 Play Game
        </button>
      </div>
    </div>
  )
}

export default WorldBuilder
