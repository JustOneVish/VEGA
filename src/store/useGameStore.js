import { create } from 'zustand';

export const useGameStore = create((set) => ({
  dimension: '3D', // '2D' or '3D'
  points: 0,
  lives: 3,
  gameState: 'START', // START, PLAYING, GAMEOVER
  
  setDimension: (dim) => set({ dimension: dim }),
  addPoints: (val) => set((state) => ({ points: state.points + val })),
  loseLife: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  setGameState: (status) => set({ gameState: status }),
  reset: () => set({ points: 0, lives: 3, gameState: 'PLAYING' }),
}));
