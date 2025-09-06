// Core game types
export interface Room {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  walkableAreas: boolean[][];
  objects: GameObject[];
  connections: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  createdAt: Date;
}

export interface GameObject {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive: boolean;
}

export interface World {
  id: string;
  name: string;
  rooms: Room[];
  layout: WorldLayout;
  startingRoomId: string;
  createdAt: Date;
}

export interface WorldLayout {
  grid: (string | null)[][];
  gridSize: { width: number; height: number };
}

export interface Player {
  x: number;
  y: number;
  direction: 'north' | 'south' | 'east' | 'west';
  currentRoomId: string;
}

// AI Generation types
export interface GenerationRequest {
  images: File[];
  prompt?: string;
  style: 'pokemon' | 'retro' | 'modern';
}

export interface GenerationResult {
  room: Room;
  success: boolean;
  error?: string;
}

// UI types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export type ViewMode = 'dashboard' | 'generator' | 'editor' | 'game';