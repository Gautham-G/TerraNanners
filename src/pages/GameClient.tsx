import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ViewMode, World, Room } from '../types';
import { getWorlds, getRoom } from '../lib/storage';
import Notification from '../components/ui/Notification';

interface GameClientProps {
  onNavigate: (view: ViewMode) => void;
}

interface Player {
  x: number;
  y: number;
  direction: 'north' | 'south' | 'east' | 'west';
  currentRoomId: string | null;
}

const GameClient: React.FC<GameClientProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    direction: 'south',
    currentRoomId: null
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef(player);
  const currentRoomRef = useRef(currentRoom);
  const roomImageRef = useRef<HTMLImageElement | null>(null);

  // Update refs when state changes
  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    roomImageRef.current = roomImage;
  }, [roomImage]);

  useEffect(() => {
    loadWorlds();
  }, []);

  // Load room image when current room changes
  useEffect(() => {
    if (currentRoom?.imageUrl) {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Room image loaded:', currentRoom.name);
        setRoomImage(img);
      };
      img.onerror = (error) => {
        console.error('❌ Failed to load room image:', error);
        setRoomImage(null);
      };
      img.src = currentRoom.imageUrl;
    } else {
      setRoomImage(null);
    }
  }, [currentRoom?.imageUrl]);

  // Game loop effect - Fixed to prevent infinite loop
  useEffect(() => {
    if (!gameStarted || !currentRoom) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    let animationId: number;

    const gameLoop = () => {
      const currentKeys = keysRef.current;
      const currentPlayer = playerRef.current;
      const currentRoomData = currentRoomRef.current;

      // Update player position based on keys
      const speed = 3;
      let newX = currentPlayer.x;
      let newY = currentPlayer.y;
      let newDirection = currentPlayer.direction;
      let moved = false;

      if (currentKeys.has('arrowup') || currentKeys.has('w')) {
        newY -= speed;
        newDirection = 'north';
        moved = true;
      }
      if (currentKeys.has('arrowdown') || currentKeys.has('s')) {
        newY += speed;
        newDirection = 'south';
        moved = true;
      }
      if (currentKeys.has('arrowleft') || currentKeys.has('a')) {
        newX -= speed;
        newDirection = 'west';
        moved = true;
      }
      if (currentKeys.has('arrowright') || currentKeys.has('d')) {
        newX += speed;
        newDirection = 'east';
        moved = true;
      }

      // Boundary checking
      const bananaSize = 20;
      if (newX < bananaSize) newX = bananaSize;
      if (newX > canvas.width - bananaSize) newX = canvas.width - bananaSize;
      if (newY < bananaSize) newY = bananaSize;
      if (newY > canvas.height - bananaSize) newY = canvas.height - bananaSize;

      // Check for room transitions at edges
      if (moved && selectedWorld) {
        const edgeThreshold = 30;
        let nextRoomId: string | null = null;

        if (newX <= edgeThreshold && currentRoomData?.connections?.west) {
          nextRoomId = currentRoomData.connections.west;
        } else if (newX >= canvas.width - edgeThreshold && currentRoomData?.connections?.east) {
          nextRoomId = currentRoomData.connections.east;
        } else if (newY <= edgeThreshold && currentRoomData?.connections?.north) {
          nextRoomId = currentRoomData.connections.north;
        } else if (newY >= canvas.height - edgeThreshold && currentRoomData?.connections?.south) {
          nextRoomId = currentRoomData.connections.south;
        }

        if (nextRoomId) {
          const nextRoom = selectedWorld.rooms.find(room => room.id === nextRoomId);
          if (nextRoom) {
            // Transition to next room
            setCurrentRoom(nextRoom);
            setPlayer(prev => ({
              ...prev,
              currentRoomId: nextRoom.id,
              x: newDirection === 'west' ? canvas.width - 50 : 
                 newDirection === 'east' ? 50 :
                 newDirection === 'north' ? newX :
                 newX,
              y: newDirection === 'north' ? canvas.height - 50 :
                 newDirection === 'south' ? 50 :
                 newDirection === 'west' ? newY :
                 newY,
              direction: newDirection
            }));
            setNotification({
              message: `🚪 Entered ${nextRoom.name}`,
              type: 'info'
            });
            // Auto-hide notification after 2 seconds
            setTimeout(() => setNotification(null), 2000);
            return; // Exit this frame, next frame will have new room
          }
        }
      }

      // Update player state only if position or direction changed
      if (moved || newDirection !== currentPlayer.direction) {
        setPlayer(prev => ({
          ...prev,
          x: newX,
          y: newY,
          direction: newDirection
        }));
      }

      // Clear canvas
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw room background if available
      const currentRoomImage = roomImageRef.current;
      if (currentRoomImage && currentRoomImage.complete && currentRoomImage.naturalWidth > 0) {
        try {
          ctx.globalAlpha = 0.8;
          ctx.drawImage(currentRoomImage, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;
        } catch (drawError) {
          console.error('❌ Error drawing image to canvas:', drawError);
        }
      } else {
        // Draw a simple background pattern when no room image
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Show loading message only if we're expecting an image
        if (currentRoomData?.imageUrl) {
          ctx.fillStyle = '#FFD700';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading Room Image...', canvas.width / 2, canvas.height / 2);
          ctx.textAlign = 'left';
        }
      }

      // Draw banana character
      drawBananaCharacter(ctx, newX, newY, newDirection);

      // Draw UI elements
      drawUI(ctx, currentRoomData);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStarted, currentRoom?.id]); // Only depend on gameStarted and room ID

  // Keyboard event handling
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  const loadWorlds = async () => {
    try {
      const savedWorlds = await getWorlds();
      setWorlds(savedWorlds);
    } catch (error) {
      console.error('Failed to load worlds:', error);
      setNotification({
        message: 'Failed to load worlds',
        type: 'error'
      });
    }
  };

  const startGame = async (world: World) => {
    try {
      setSelectedWorld(world);
      
      // Load the starting room
      const startingRoom = world.rooms.find(room => room.id === world.startingRoomId) || world.rooms[0];
      if (!startingRoom) {
        throw new Error('No rooms found in world');
      }

      setCurrentRoom(startingRoom);
      setPlayer(prev => ({
        ...prev,
        currentRoomId: startingRoom.id,
        x: 400, // Center of canvas
        y: 300
      }));
      setGameStarted(true);
      
      setNotification({
        message: `🍌 Entered world: ${world.name}`,
        type: 'success'
      });
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: 'Failed to start game',
        type: 'error'
      });
    }
  };

  const drawBananaCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, direction: string) => {
    ctx.save();
    
    // Banana body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Banana curve
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 8, 0, Math.PI);
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000';
    const eyeOffset = direction === 'west' ? -2 : direction === 'east' ? 2 : 0;
    ctx.fillRect(x - 5 + eyeOffset, y - 8, 3, 3);
    ctx.fillRect(x + 2 + eyeOffset, y - 8, 3, 3);
    
    // Mouth
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y - 2, 3, 0, Math.PI);
    ctx.stroke();
    
    // Direction indicator (small arrow)
    ctx.fillStyle = '#FF6B6B';
    ctx.save();
    ctx.translate(x, y - 25);
    
    switch (direction) {
      case 'north':
        ctx.rotate(0);
        break;
      case 'east':
        ctx.rotate(Math.PI / 2);
        break;
      case 'south':
        ctx.rotate(Math.PI);
        break;
      case 'west':
        ctx.rotate(-Math.PI / 2);
        break;
    }
    
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    ctx.restore();
  };

  const drawUI = (ctx: CanvasRenderingContext2D, room?: Room | null) => {
    // Room name
    if (room) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 30);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText(`Room: ${room.name}`, 15, 30);
    }
    
    // Controls
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, ctx.canvas.height - 100, 220, 90);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('WASD/Arrow Keys: Move', 15, ctx.canvas.height - 75);
    ctx.fillText('ESC: Back to menu', 15, ctx.canvas.height - 55);
    ctx.fillText('Walk to room edges to', 15, ctx.canvas.height - 35);
    ctx.fillText('navigate between rooms', 15, ctx.canvas.height - 15);
  };

  const exitGame = () => {
    setGameStarted(false);
    setSelectedWorld(null);
    setCurrentRoom(null);
    setPlayer({
      x: 400,
      y: 300,
      direction: 'south',
      currentRoomId: null
    });
    setKeys(new Set());
  };

  // Handle ESC key to exit game
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameStarted) {
        exitGame();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gameStarted]);

  if (gameStarted && currentRoom) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-yellow-400 pixel-art"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute top-4 right-4 text-yellow-400 text-sm">
            <div>World: {selectedWorld?.name}</div>
            <div>Room: {currentRoom.name}</div>
          </div>
        </div>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="retro-text text-4xl">🍌🎮 TerraNanners Adventure</h1>
          <p className="text-yellow-300 mt-2 retro-text">Choose a world to explore with your banana character!</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('editor')}
          className="retro-button"
        >
          🏗️ Build Worlds
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worlds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full retro-card text-center py-12"
          >
            <h3 className="text-xl font-semibold mb-2 retro-text">No Worlds Available</h3>
            <p className="text-yellow-300 mb-4">Create some worlds first to start your banana adventure!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('editor')}
              className="retro-button"
            >
              🏗️ Create Your First World
            </motion.button>
          </motion.div>
        ) : (
          worlds.map((world) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="retro-card"
            >
              <h3 className="text-xl font-semibold mb-2 retro-text">{world.name}</h3>
              <p className="text-yellow-300 mb-3">
                {world.rooms.length} room{world.rooms.length !== 1 ? 's' : ''}
              </p>
              
              {/* Preview of rooms */}
              <div className="grid grid-cols-2 gap-1 mb-4 h-20">
                {world.rooms.slice(0, 4).map((room) => (
                  <div
                    key={room.id}
                    className="bg-yellow-900 rounded border border-yellow-600 flex items-center justify-center text-xs pixel-art"
                    style={{
                      backgroundImage: room.imageUrl ? `url(${room.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!room.imageUrl && (
                      <span className="text-yellow-400">{room.name.slice(0, 3)}</span>
                    )}
                  </div>
                ))}
                {world.rooms.length > 4 && (
                  <div className="bg-yellow-900 rounded border border-yellow-600 flex items-center justify-center text-xs">
                    <span className="text-yellow-400">+{world.rooms.length - 4}</span>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(world)}
                className="retro-button w-full"
              >
                🍌 Start Adventure
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default GameClient;