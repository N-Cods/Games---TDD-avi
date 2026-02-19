export type Position = {
  x: number;
  y: number;
};

export enum TowerType {
  BASIC = 'BASIC',
  SNIPER = 'SNIPER',
  RAPID = 'RAPID',
  AOE = 'AOE',
}

export enum EnemyType {
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE',
  CIRCLE = 'CIRCLE',
  DIAMOND = 'DIAMOND',
  BOSS = 'BOSS',
}

export interface TowerConfig {
  name: string;
  cost: number;
  damage: number;
  range: number;
  cooldown: number; // in ms
  color: string;
  description: string;
}

export interface TowerEntity {
  id: string;
  gridPos: Position;
  type: TowerType;
  level: number;
  damage: number;
  range: number;
  cooldown: number;
  lastFired: number;
  targetId: string | null;
  totalKills: number;
  autoUpgrade: boolean; // New feature
}

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  gridPos: Position; // Logical grid position (for pathing)
  worldPos: Position; // Exact pixel/float position (for smooth movement)
  nextGridPos: Position | null; // Where it is moving to
  progress: number; // 0.0 to 1.0 between current and next grid pos
  hp: number;
  maxHp: number;
  speed: number;
  value: number; // Money on kill
  frozen: number; // slow effect duration
}

export interface Projectile {
  id: string;
  startPos: Position;
  targetPos: Position; // We shoot at a static point to avoid homing missiles looking weird
  progress: number; // 0 to 1
  speed: number;
  color: string;
  damage: number;
  aoe?: number;
}

export interface WaveConfig {
  count: number;
  interval: number; // ms between spawns
  types: EnemyType[];
  hpMultiplier: number;
}

export interface GameState {
  money: number;
  lives: number;
  wave: number;
  isPlaying: boolean;
  isGameOver: boolean;
  gameSpeed: number;
  autoWave: boolean; // New feature
}