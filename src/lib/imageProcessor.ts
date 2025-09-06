// Image processing utilities for PokéBanana World Builder
export class ImageProcessor {
  
  // Apply Pokemon-style filters to an image
  static async applyPokemonFilter(imageFile: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Draw the original image
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        if (ctx) {
          // Apply pixelation effect
          ctx.imageSmoothingEnabled = false;
          
          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Apply color enhancement for Pokemon-style look
          for (let i = 0; i < data.length; i += 4) {
            // Increase saturation and brightness
            data[i] = Math.min(255, data[i] * 1.2);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green  
            data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
            // Alpha stays the same
          }
          
          // Apply processed image data
          ctx.putImageData(imageData, 0, 0);
        }
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(base64);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }
  
  // Add banana-themed overlay elements
  static async addBananaTheme(imageFile: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 800;
        canvas.height = 600;
        
        if (ctx) {
          // Draw background
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Add subtle banana-themed elements
          ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add door indicators on left and right
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          // Left door
          ctx.fillRect(0, canvas.height / 2 - 30, 20, 60);
          // Right door  
          ctx.fillRect(canvas.width - 20, canvas.height / 2 - 30, 20, 60);
          
          // Add some sparkle effects
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(base64);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }
}
