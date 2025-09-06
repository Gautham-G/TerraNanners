#!/bin/bash

echo "🍌⚡ Setting up PokéBanana World Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "🔑 Setting up environment file..."
    echo "VITE_GEMINI_API_KEY=your_actual_api_key_here" > .env.local
    echo "⚠️  Please edit .env.local and add your real Gemini API key!"
    echo "   Get one at: https://ai.google.dev/"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🍌 PokéBanana World Builder is ready!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Gemini API key"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:5174"
echo "4. Go bananas! 🍌🚀"
