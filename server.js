// Simple Express server for local file operations
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

const ROOMS_DIR = path.join(process.cwd(), 'public', 'data', 'rooms')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'generated-rooms')

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(ROOMS_DIR, { recursive: true })
    await fs.mkdir(IMAGES_DIR, { recursive: true })
    console.log('📁 Directories created/verified')
  } catch (error) {
    console.error('❌ Failed to create directories:', error)
  }
}

// Save room to JSON file
app.post('/api/save-room', async (req, res) => {
  try {
    const room = req.body
    const filePath = path.join(ROOMS_DIR, `${room.id}.json`)
    
    await fs.writeFile(filePath, JSON.stringify(room, null, 2))
    
    res.json({ success: true, path: filePath })
    console.log('💾 Room saved:', room.id)
  } catch (error) {
    console.error('❌ Failed to save room:', error)
    res.status(500).json({ error: 'Failed to save room' })
  }
})

// Load all rooms
app.get('/api/load-rooms', async (req, res) => {
  try {
    const files = await fs.readdir(ROOMS_DIR)
    const rooms = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(ROOMS_DIR, file)
          const roomData = await fs.readFile(filePath, 'utf8')
          rooms.push(JSON.parse(roomData))
        } catch (error) {
          console.warn('⚠️ Failed to load room file:', file)
        }
      }
    }
    
    res.json(rooms)
    console.log('📂 Loaded rooms:', rooms.length)
  } catch (error) {
    console.error('❌ Failed to load rooms:', error)
    res.status(500).json({ error: 'Failed to load rooms' })
  }
})

// Save image to file
app.post('/api/save-image', async (req, res) => {
  try {
    const { imageData, filename } = req.body
    const filePath = path.join(IMAGES_DIR, filename)
    
    // Remove data:image/png;base64, prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    
    await fs.writeFile(filePath, base64Data, 'base64')
    
    res.json({ success: true, path: `/generated-rooms/${filename}` })
    console.log('🖼️ Image saved:', filename)
  } catch (error) {
    console.error('❌ Failed to save image:', error)
    res.status(500).json({ error: 'Failed to save image' })
  }
})

// Delete room
app.delete('/api/delete-room/:id', async (req, res) => {
  try {
    const roomId = req.params.id
    const filePath = path.join(ROOMS_DIR, `${roomId}.json`)
    
    await fs.unlink(filePath)
    
    res.json({ success: true })
    console.log('🗑️ Room deleted:', roomId)
  } catch (error) {
    console.error('❌ Failed to delete room:', error)
    res.status(500).json({ error: 'Failed to delete room' })
  }
})

// Start server
app.listen(PORT, async () => {
  await ensureDirectories()
  console.log(`🚀 File server running on http://localhost:${PORT}`)
  console.log('📁 Rooms directory:', ROOMS_DIR)
  console.log('🖼️ Images directory:', IMAGES_DIR)
})
