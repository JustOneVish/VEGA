import { create } from 'zustand';
import foodData from './india_food_items.json';

export const useGameStore = create((set) => ({
  dimension: '3D', // '2D' or '3D'
  points: 50, // Syncs with player weight for GDD rules
  lives: 3,
  gameState: 'START', // START, PLAYING, GAMEOVER, WON
  weight: 50, // range 20 - 100
  timeLeft: 60,
  distance: 0,
  dietaryPreference: 'ALL', // 'ALL', 'VEG', 'VEGAN', 'JAIN'
  lastCollectedFoodName: '',
  lastCollectedFoodWeight: 0,
  filteredFoods: foodData.foods || [],

  setDimension: (dim) => set({ dimension: dim }),
  
  setDietaryPreference: (pref) => set(() => {
    const list = foodData.foods || [];
    let filtered = list;
    if (pref === 'VEG') {
      filtered = list.filter(f => f.veg === true);
    } else if (pref === 'VEGAN') {
      filtered = list.filter(f => f.vegan === true);
    } else if (pref === 'JAIN') {
      filtered = list.filter(f => f.jain === true);
    }
    return { 
      dietaryPreference: pref, 
      filteredFoods: filtered 
    };
  }),

  adjustWeight: (amount, foodName) => set((state) => {
    if (state.gameState !== 'PLAYING') return {};

    const newWeight = Math.min(100, Math.max(20, state.weight + amount));
    
    // Check if player becomes too heavy
    let nextState = state.gameState;
    if (newWeight >= 100) {
      nextState = 'GAMEOVER';
    }

    return {
      weight: newWeight,
      points: newWeight,
      lastCollectedFoodName: foodName,
      lastCollectedFoodWeight: amount,
      gameState: nextState
    };
  }),

  loseLife: () => set((state) => {
    if (state.gameState !== 'PLAYING') return {};
    const newLives = Math.max(0, state.lives - 1);
    const nextState = newLives <= 0 ? 'GAMEOVER' : state.gameState;
    return { 
      lives: newLives,
      gameState: nextState
    };
  }),

  tickTimer: () => set((state) => {
    if (state.gameState !== 'PLAYING') return {};
    const nextTime = Math.max(0, state.timeLeft - 1);
    
    let nextState = state.gameState;
    if (nextTime <= 0) {
      if (state.weight < 100) {
        nextState = 'WON';
      } else {
        nextState = 'GAMEOVER';
      }
    }

    return { 
      timeLeft: nextTime,
      gameState: nextState
    };
  }),

  updateDistance: (z) => set((state) => {
    if (state.gameState !== 'PLAYING') return {};
    const dist = Math.min(720, Math.max(0, Math.abs(z)));
    
    let nextState = state.gameState;
    if (dist >= 720) {
      if (state.weight < 100) {
        nextState = 'WON';
      } else {
        nextState = 'GAMEOVER';
      }
    }

    return { 
      distance: dist,
      gameState: nextState
    };
  }),

  setGameState: (status) => set({ gameState: status }),
  
  reset: () => set((state) => {
    const list = foodData.foods || [];
    let filtered = list;
    const pref = state.dietaryPreference;
    if (pref === 'VEG') {
      filtered = list.filter(f => f.veg === true);
    } else if (pref === 'VEGAN') {
      filtered = list.filter(f => f.vegan === true);
    } else if (pref === 'JAIN') {
      filtered = list.filter(f => f.jain === true);
    }
    return {
      points: 50,
      weight: 50,
      lives: 3,
      timeLeft: 60,
      distance: 0,
      lastCollectedFoodName: '',
      lastCollectedFoodWeight: 0,
      gameState: 'PLAYING',
      filteredFoods: filtered
    };
  }),
}));
