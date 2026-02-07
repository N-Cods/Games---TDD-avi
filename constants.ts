import { TowerType, TowerConfig, EnemyType } from './types';

export const GRID_W = 22;
export const GRID_H = 11;
export const CELL_SIZE = 48; // px

export const TOWER_STATS: Record<TowerType, TowerConfig> = {
  [TowerType.BASIC]: {
    name: "Cannon",
    cost: 50,
    damage: 20,
    range: 3.5, 
    cooldown: 800,
    color: "bg-slate-700", // Dark Grey
    description: "Standard kinetic defense.",
  },
  [TowerType.SNIPER]: {
    name: "Sniper",
    cost: 120,
    damage: 100,
    range: 7,
    cooldown: 2000,
    color: "bg-emerald-800", // Dark Green camo
    description: "Long range, high damage.",
  },
  [TowerType.RAPID]: {
    name: "M. Gun",
    cost: 150,
    damage: 8,
    range: 2.5,
    cooldown: 150,
    color: "bg-amber-700", // Brass/Military
    description: "High fire rate.",
  },
  [TowerType.AOE]: {
    name: "Ice Tower",
    cost: 200,
    damage: 40,
    range: 2,
    cooldown: 1500,
    color: "bg-cyan-500", // Ice Blue
    description: "Freezes area around it.",
  },
};

export const ENEMY_STATS: Record<EnemyType, { hp: number; speed: number; value: number; color: string }> = {
  [EnemyType.SQUARE]: { hp: 30, speed: 2.0, value: 15, color: '#fca5a5' }, 
  [EnemyType.TRIANGLE]: { hp: 20, speed: 3.5, value: 25, color: '#fdba74' }, 
  [EnemyType.CIRCLE]: { hp: 80, speed: 1.2, value: 45, color: '#86efac' }, 
  [EnemyType.DIAMOND]: { hp: 150, speed: 1.5, value: 80, color: '#93c5fd' }, 
  [EnemyType.BOSS]: { hp: 1000, speed: 0.8, value: 400, color: '#d8b4fe' }, 
};

export const START_MONEY = 500;
export const START_LIVES = 20;