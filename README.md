# 🍌 AI World Explorer

Transform your photos into playable game worlds with AI! Create immersive room-based adventures where you control a banana character exploring AI-generated environments.

## ✨ Features

- **🖼️ AI-Powered Room Generation**: Upload photos and watch AI transform them into game environments
- **🗺️ World Building**: Connect rooms to create expansive, interconnected game worlds  
- **🎮 Interactive Gameplay**: Control a banana character through your created worlds
- **💾 Persistent Storage**: Save and load your creations locally
- **🎨 Beautiful UI**: Smooth animations and modern design

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Gemini API**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the Application**
   ```bash
   npm run dev:full
   ```
   This starts both the frontend (port 5173) and backend (port 3001) servers.

4. **Open Browser**
   - Navigate to http://localhost:5173
   - Start creating your first world!

## 🎯 How to Use

1. **Generate Rooms**: 
   - Go to the Generator page
   - Upload an image
   - Let AI create a game room with description and visual style

2. **Build Worlds**: 
   - Use the World Editor to connect your rooms
   - Create pathways between different environments
   - Design your adventure flow

3. **Play**: 
   - Use the Game Client to explore your worlds
   - Control the banana character with arrow keys or WASD
   - Move between connected rooms seamlessly

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express (for file operations)
- **Styling**: Tailwind CSS + Framer Motion
- **Storage**: LocalStorage + IndexedDB via LocalForage
- **AI**: Google Gemini API for room generation
- **Canvas**: HTML5 Canvas for game rendering

## 📁 Project Structure

```
src/
├── pages/           # Main application pages
│   ├── Dashboard.tsx    # Home dashboard
│   ├── Generator.tsx    # AI room generation
│   ├── WorldEditor.tsx  # World building interface
│   └── GameClient.tsx   # Game player
├── components/      # Reusable UI components
├── lib/            # Core logic and utilities
└── types/          # TypeScript type definitions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend

### Environment Variables

Create a `.env.local` file with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Deployment

The application can be deployed as a static site. The backend is only needed for development file operations.

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project as inspiration for your own AI-powered games!

---

**Made with 🍌 and AI magic**

```
src/
├── components/     # Reusable UI components
├── pages/          # Main application views
├── lib/            # Utilities and services
├── types/          # TypeScript definitions
└── assets/         # Static assets
```

## 🎮 Controls

- **Arrow Keys**: Move character
- **E Key**: Interact with objects
- **Escape**: Open menu

## 📝 Development

This project follows the specifications in `CLAUDE.md` for AI-assisted development.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

Built for hackathons and creative exploration! 🎨✨
