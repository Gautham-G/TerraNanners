import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenAI } from '@google/genai'
import { ImageProcessor } from './imageProcessor'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

console.log('🔑 Gemini API Setup:', {
  keyPresent: !!API_KEY,
  keyLength: API_KEY?.length || 0,
  keyPrefix: API_KEY?.substring(0, 10) + '...',
  env: import.meta.env.MODE
})

if (!API_KEY) {
  console.warn('❌ VITE_GEMINI_API_KEY not found in environment variables')
  console.warn('Make sure .env.local file exists with: VITE_GEMINI_API_KEY=your_key_here')
} else {
  console.log('✅ Gemini API key loaded successfully')
}

const genAI = new GoogleGenerativeAI(API_KEY || '')
const nativeGenAI = new GoogleGenAI({
  apiKey: API_KEY
})

// Use the correct model names for the standard SDK
const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export interface RoomGenerationRequest {
  imageFile: File
  style: 'pokemon' | 'retro' | 'modern'
  theme?: string
}

export interface RoomGenerationResult {
  roomImage: string // base64 or local file path
  roomDescription: string
  atmosphereDescription: string
  suggestedObjects: string[]
  success: boolean
  error?: string
  localImagePath?: string // Path to locally saved image
}

// Function to generate image using native Gemini 2.5 Flash Image Preview
export async function generateRoomImageNative(
  originalImageFile: File, 
  style: string, 
  theme?: string
): Promise<{ imageData: string; localPath: string } | null> {
  try {
    console.log('🖼️ Generating Pokemon-style room based on uploaded image...')
    
    // First, analyze the uploaded image to understand its layout
    console.log('🔍 Analyzing uploaded image layout...')
    const imageBase64 = await fileToBase64(originalImageFile)
    
    const analysisResult = await imageModel.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: originalImageFile.type
        }
      },
      `Analyze this room image in detail. Describe:
      1. Room layout and dimensions
      2. Furniture placement and types (bed, desk, chair, etc.)
      3. Windows and door locations
      4. Color scheme and lighting
      5. Overall room type (bedroom, living room, etc.)
      
      Be very specific about the spatial arrangement.`
    ])

    const roomAnalysis = analysisResult.response.text()
    console.log('✅ Room analysis complete:', roomAnalysis?.substring(0, 200) + '...')
    
    // Create prompt that transforms the specific room into Pokemon style
    const prompt = `Transform the room described below into a top-down 2D Pokemon-style game room.

ORIGINAL ROOM ANALYSIS:
${roomAnalysis}

TRANSFORMATION REQUIREMENTS:
- Convert to pixel art top-down view (bird's eye perspective) 
- MAINTAIN the same room layout, furniture placement, and proportions
- Transform furniture into Pokemon-world equivalents (bed→Pokemon bed, desk→PC station, etc.)
- Pokemon game aesthetic with vibrant, saturated colors
- Include doors/exits where they appear in the original room
- 16-bit retro game style like classic Pokemon games
- Game-ready layout suitable for tile-based movement
- Add subtle banana-themed details for the "Nano Banana Hackathon"

STYLE: ${style}
${theme ? `THEME: ${theme}` : ''}

Create a Pokemon-style room that maintains the exact layout and feel of the original image.`

    console.log('📝 Image generation prompt created')
    
    // Generate image using native API
    const response = await nativeGenAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    })

    console.log('✅ Image generation response received')
    
    // Extract image data with proper null checking
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const filename = `room-${timestamp}.png`
          const localPath = `/generated-rooms/${filename}`
          
          console.log('💾 Generated image ready for local storage:', localPath)
          
          // Return the base64 data and virtual path
          return {
            imageData,
            localPath: localPath
          }
        }
      }
    }
    
    throw new Error('No image data found in response')
    
  } catch (error) {
    console.error('❌ Native image generation failed:', error)
    return null
  }
}

export async function generateRoom(request: RoomGenerationRequest): Promise<RoomGenerationResult> {
  try {
    console.log('🔄 Starting room generation with Gemini...')
    console.log('📸 Image file:', request.imageFile.name, 'Size:', request.imageFile.size)
    
    // First test API connectivity
    console.log('🔑 Testing API key...')
    const testResult = await testGeminiConnection()
    if (!testResult) {
      throw new Error('Gemini API connection failed. Please check your API key.')
    }
    console.log('✅ API connection successful')
    
    // Convert image to base64 for the API
    console.log('🔄 Converting image to base64...')
    const imageBase64 = await fileToBase64(request.imageFile)
    console.log('✅ Image converted, size:', imageBase64.length, 'characters')
    
    // Create the Pokemon-style room generation prompt
    const imagePrompt = createImagePrompt(request.style, request.theme)
    console.log('📝 Generated prompt:', imagePrompt.substring(0, 100) + '...')
    
    // Since Gemini Flash doesn't support direct image generation, we'll:
    // 1. Analyze the image to understand the room layout
    // 2. Generate a detailed description for visualization
    // 3. Use the original image with processing instructions
    
    console.log('🔄 Analyzing image with Gemini...')
    const imageAnalysisResult = await imageModel.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: request.imageFile.type
        }
      },
      `Analyze this room image and describe how it would look as a Pokemon-style top-down 2D game room. 
      
      Focus on:
      - Room layout and furniture placement
      - What objects would be interactive (beds, desks, computers, etc.)
      - Where doors/exits would be placed (left and right walls)
      - Color scheme and atmosphere
      - Game-appropriate objects that fit the Pokemon world
      
      Be detailed and specific about the visual transformation.`
    ])

    const imageAnalysis = imageAnalysisResult.response.text()
    console.log('✅ Image analysis received:', imageAnalysis.substring(0, 200) + '...')

    // Generate comprehensive room description and atmosphere
    console.log('🔄 Generating room description...')
    const textPrompt = createTextPrompt(request.style, request.theme)
    const textResult = await textModel.generateContent(textPrompt + `\n\nBase the room on this analysis: ${imageAnalysis}`)
    const textResponse = textResult.response.text()
    console.log('✅ Text generation completed')

    // Parse the text response
    const parsedResponse = parseTextResponse(textResponse || '')
    console.log('✅ Response parsed:', parsedResponse)

    // Generate new Pokemon-style room image using native API
    console.log('🔄 Generating new room image with Gemini 2.5 Flash...')
    const nativeImageResult = await generateRoomImageNative(
      request.imageFile, 
      request.style, 
      request.theme
    )

    let finalRoomImage = ''
    let localImagePath = ''

    if (nativeImageResult) {
      console.log('✅ Native image generation successful!')
      finalRoomImage = `data:image/png;base64,${nativeImageResult.imageData}`
      localImagePath = nativeImageResult.localPath
      
      // Also save the image data to localStorage for demo purposes
      try {
        localStorage.setItem(`room-image-${Date.now()}`, nativeImageResult.imageData)
        console.log('💾 Image data saved to localStorage')
      } catch (e) {
        console.warn('⚠️ Could not save to localStorage:', e)
      }
    } else {
      console.log('⚠️ Native image generation failed, falling back to processed original image')
      finalRoomImage = await ImageProcessor.addBananaTheme(request.imageFile)
    }

    console.log('🎉 Room generation successful!')
    return {
      roomImage: finalRoomImage,
      roomDescription: parsedResponse.description || imageAnalysis || 'A mysterious Pokemon-style room awaits exploration.',
      atmosphereDescription: parsedResponse.atmosphere || 'The air is filled with adventure and mystery.',
      suggestedObjects: parsedResponse.objects.length > 0 ? parsedResponse.objects : [
        'Pokeball', 'Treasure Chest', 'Crystal', 'Ancient Book', 'Healing Station', 'PC', 'Plant', 'Map'
      ],
      success: true,
      localImagePath
    }

  } catch (error) {
    console.error('❌ Room generation failed:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      roomImage: '',
      roomDescription: '',
      atmosphereDescription: '',
      suggestedObjects: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

function createImagePrompt(style: string, theme?: string): string {
  const basePrompt = `Transform this image into a top-down 2D game room in ${style} style.

CRITICAL REQUIREMENTS:
- Top-down perspective (bird's eye view)
- Pixel art aesthetic similar to classic Pokemon games
- MUST include doors/exits on the middle-left and middle-right edges
- Clean, game-ready artwork suitable for tile-based movement
- Maintain the general layout and objects from the original image
- Use vibrant, saturated colors typical of retro games
- Include Pokemon-world appropriate furniture and objects`

  if (theme) {
    return `${basePrompt}\n- Room theme: ${theme}`
  }

  return basePrompt
}

function createTextPrompt(style: string, theme?: string): string {
  return `Based on the room image I'm generating, provide a JSON response with the following structure:

{
  "description": "A 2-3 sentence description of the room suitable for a Pokemon-style adventure game",
  "atmosphere": "A detailed atmospheric description including sounds, lighting, and mood",
  "objects": ["list", "of", "5-8", "interactive", "pokemon", "objects", "in", "the", "room"]
}

Style: ${style}
${theme ? `Theme: ${theme}` : 'Theme: Pokemon adventure setting'}

Make it engaging and suitable for exploration gameplay. Focus on creating intrigue and discovery opportunities.`
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function parseTextResponse(response: string): {
  description: string
  atmosphere: string
  objects: string[]
} {
  try {
    const parsed = JSON.parse(response)
    return {
      description: parsed.description || 'A mysterious room awaits exploration.',
      atmosphere: parsed.atmosphere || 'The room is filled with an air of mystery and adventure.',
      objects: Array.isArray(parsed.objects) ? parsed.objects : []
    }
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      description: 'A mysterious room awaits exploration.',
      atmosphere: 'The room is filled with an air of mystery and adventure.',
      objects: ['mysterious object', 'hidden treasure', 'ancient artifact']
    }
  }
}

// Test function for API connectivity
export async function testGeminiConnection(): Promise<boolean> {
  try {
    console.log('🔑 Testing Gemini API connection...')
    console.log('API Key present:', !!API_KEY)
    console.log('API Key length:', API_KEY?.length || 0)
    
    if (!API_KEY) {
      console.error('❌ No API key provided')
      return false
    }
    
    const startTime = Date.now()
    const result = await textModel.generateContent('Hello, are you working? Please respond with "Yes, I am working!"')
    const endTime = Date.now()
    
    const response = result.response.text()
    console.log('✅ API Response received in', endTime - startTime, 'ms:', response)
    console.log('✅ Response length:', response.length)
    
    return response.length > 0
  } catch (error) {
    console.error('❌ Gemini API test failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return false
  }
}