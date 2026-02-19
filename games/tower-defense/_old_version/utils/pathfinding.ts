import { GRID_W, GRID_H } from '../constants';
import { Position } from '../types';

// Convert x,y to string key
export const posKey = (p: Position) => `${p.x},${p.y}`;

// Directions: Right, Down, Up, Left
const DIRS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export interface Range {
    min: number;
    max: number;
}

/**
 * Calculates a Flow Field.
 * Instead of calculating a path for every enemy, we calculate a map where
 * every cell points to the next best cell to reach the target.
 * We work BACKWARDS from the goal (Right side) to the start.
 */
export const calculateFlowField = (
    towers: Map<string, any>, 
    exitYRange: Range
): Map<string, Position> | null => {
  const queue: Position[] = [];
  const visited = new Set<string>();
  const flowMap = new Map<string, Position>();

  // Initialize targets: Cells in the last column within exitYRange
  for (let y = exitYRange.min; y <= exitYRange.max; y++) {
    const target = { x: GRID_W - 1, y };
    // If blocked by tower, it's not a target
    if (!towers.has(posKey(target))) {
      queue.push(target);
      visited.add(posKey(target));
      // The exit cells point to "null" or themselves effectively, handled by logic
    }
  }

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check neighbors
    for (const dir of DIRS) {
      const neighbor = { x: current.x + dir.x, y: current.y + dir.y };
      const nKey = posKey(neighbor);

      // Bounds check
      if (
        neighbor.x >= 0 &&
        neighbor.x < GRID_W &&
        neighbor.y >= 0 &&
        neighbor.y < GRID_H &&
        !visited.has(nKey) &&
        !towers.has(nKey)
      ) {
        visited.add(nKey);
        // The neighbor should flow TO the current cell
        flowMap.set(nKey, current);
        queue.push(neighbor);
      }
    }
  }

  // We return the map regardless of coverage; validation is up to the caller
  return flowMap;
};

// Check if a specific tower placement blocks the path entirely
export const isPlacementValid = (
    towers: Map<string, any>, 
    newTowerPos: Position,
    spawnYRange: Range,
    exitYRange: Range
): boolean => {
    // Create a temporary map with the new tower
    const tempTowers = new Map(towers);
    tempTowers.set(posKey(newTowerPos), true);
    
    const flowField = calculateFlowField(tempTowers, exitYRange);
    if (!flowField) return false;

    // Validation: Ensure ALL active spawn points are reachable
    for (let y = spawnYRange.min; y <= spawnYRange.max; y++) {
        const start = { x: 0, y };
        // If the start point itself is not in the flow field, it's either blocked by a tower or disconnected
        if (!flowField.has(posKey(start))) {
            return false;
        }
    }

    return true;
}
