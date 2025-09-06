// Debug utilities for testing the application
export function logSystemInfo() {
  console.log('🔍 System Debug Info:')
  console.log('- Environment:', import.meta.env.MODE)
  console.log('- Gemini API Key present:', !!import.meta.env.VITE_GEMINI_API_KEY)
  console.log('- Base URL:', import.meta.env.BASE_URL)
  console.log('- User Agent:', navigator.userAgent)
  console.log('- Local Storage available:', typeof Storage !== 'undefined')
}

export function logApiTest(response: any) {
  console.log('🧪 API Test Response:', {
    success: !!response,
    responseType: typeof response,
    responseLength: response?.length || 0,
    timestamp: new Date().toISOString()
  })
}

// Run system info on load
logSystemInfo()
