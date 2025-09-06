// Helper functions for storing generated images locally
export class LocalImageStorage {
  private static readonly STORAGE_KEY = 'ai-world-explorer-images'
  private static readonly LOCAL_DIR = '/Users/gauthamgururajan/Desktop/Practice/banan/ai-world-explorer/public/generated-rooms'

  // Save image to localStorage (for browser persistence)
  static saveToLocalStorage(imageId: string, imageData: string): void {
    try {
      const stored = this.getStoredImages()
      stored[imageId] = {
        data: imageData,
        timestamp: new Date().toISOString(),
        id: imageId
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored))
      console.log('💾 Image saved to localStorage:', imageId)
    } catch (error) {
      console.error('❌ Failed to save image to localStorage:', error)
    }
  }

  // Get all stored images from localStorage
  static getStoredImages(): Record<string, { data: string; timestamp: string; id: string }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('❌ Failed to retrieve images from localStorage:', error)
      return {}
    }
  }

  // Create download link for image (browser)
  static downloadImage(imageData: string, filename: string): void {
    try {
      // Create blob from base64
      const byteCharacters = atob(imageData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('📥 Image download initiated:', filename)
    } catch (error) {
      console.error('❌ Failed to download image:', error)
    }
  }

  // Clear all stored images
  static clearStoredImages(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🗑️ All stored images cleared')
    } catch (error) {
      console.error('❌ Failed to clear stored images:', error)
    }
  }

  // Get image count
  static getImageCount(): number {
    return Object.keys(this.getStoredImages()).length
  }

  // Export all images as a JSON file (for backup)
  static exportImages(): void {
    try {
      const images = this.getStoredImages()
      const dataStr = JSON.stringify(images, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-world-explorer-images-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('📦 Images exported successfully')
    } catch (error) {
      console.error('❌ Failed to export images:', error)
    }
  }
}
