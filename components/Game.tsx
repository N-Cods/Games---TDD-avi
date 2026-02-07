import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RefreshCw, ShieldAlert, ArrowUpCircle, Trash2, X, RotateCcw, Heart, Coins, Shield, Crosshair, Snowflake, Zap, Target } from 'lucide-react';
import { GRID_W, GRID_H, CELL_SIZE, TOWER_STATS, ENEMY_STATS, START_MONEY, START_LIVES } from '../constants';
import { Position, TowerType, TowerEntity, EnemyEntity, EnemyType, Projectile, GameState, WaveConfig } from '../types';
import { calculateFlowField, isPlacementValid, posKey, Range } from '../utils/pathfinding';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substr(2, 9);

const getWaveRanges = (wave: number): { spawn: Range, exit: Range } => {
    const effectiveWave = Math.max(1, wave);
    const count = Math.min(GRID_H, effectiveWave); 
    const half = Math.floor((count - 1) / 2);
    const remainder = (count - 1) % 2;
    const center = Math.floor(GRID_H / 2);
    const min = center - half;
    const max = center + half + remainder;
    const range = { min: Math.max(0, min), max: Math.min(GRID_H - 1, max) };
    return { spawn: range, exit: range };
};

export default function Game() {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>({
    money: START_MONEY,
    lives: START_LIVES,
    wave: 0,
    isPlaying: false,
    isGameOver: false,
    gameSpeed: 1,
    autoWave: false,
  });

  const [towers, setTowers] = useState<Map<string, TowerEntity>>(new Map());
  const [enemies, setEnemies] = useState<EnemyEntity[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  
  // Interaction State
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [buildMode, setBuildMode] = useState<TowerType | null>(null);
  
  // Scale State
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for Game Loop to avoid closure staleness
  const stateRef = useRef(gameState);
  const towersRef = useRef(towers);
  const enemiesRef = useRef(enemies);
  const flowFieldRef = useRef<Map<string, Position>>(new Map());
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const waveConfigRef = useRef<WaveConfig | null>(null);
  const enemiesToSpawnRef = useRef<EnemyType[]>([]);
  const nextSpawnTimeRef = useRef<number>(0);
  const autoUpgradeTimerRef = useRef<number>(0);
  const waveEndTimeRef = useRef<number>(0); 

  // Sync refs
  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { towersRef.current = towers; }, [towers]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  // Initial Path Calculation & Recalculation on Wave Change
  useEffect(() => {
    const ranges = getWaveRanges(gameState.wave);
    const newFlow = calculateFlowField(towers, ranges.exit);
    if (newFlow) flowFieldRef.current = newFlow;
  }, [gameState.wave, towers]);

  // Scale Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const gw = GRID_W * CELL_SIZE;
        const gh = GRID_H * CELL_SIZE;
        
        // Calculate scale to fit with SAFER margin (85% of available space)
        const scaleX = (clientWidth * 0.85) / gw;
        const scaleY = (clientHeight * 0.85) / gh;
        
        const newScale = Math.min(scaleX, scaleY); 
        
        setScale(newScale);
      }
    };
    
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
    };
  }, []);

  // --- LOGIC ---

  const spawnEnemy = (type: EnemyType) => {
    const stats = ENEMY_STATS[type];
    const ranges = getWaveRanges(stateRef.current.wave);
    
    const rangeSize = ranges.spawn.max - ranges.spawn.min + 1;
    const offset = Math.floor(Math.random() * rangeSize);
    const y = ranges.spawn.min + offset;
    
    const startPos = { x: 0, y: y };
    
    let validStart = startPos;
    if (!flowFieldRef.current.has(posKey(startPos))) {
        for(let iy=ranges.spawn.min; iy<=ranges.spawn.max; iy++) {
            if (flowFieldRef.current.has(posKey({x:0, y:iy}))) {
                validStart = { x: 0, y: iy };
                break;
            }
        }
    }

    const hpMult = waveConfigRef.current ? waveConfigRef.current.hpMultiplier : 1;

    const newEnemy: EnemyEntity = {
      id: uuid(),
      type,
      gridPos: validStart,
      worldPos: { x: -1, y: validStart.y }, 
      nextGridPos: validStart,
      progress: 0,
      hp: stats.hp * hpMult,
      maxHp: stats.hp * hpMult,
      speed: stats.speed,
      value: stats.value,
      frozen: 0
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  const startNextWave = () => {
    if (stateRef.current.isPlaying && enemiesToSpawnRef.current.length > 0) return;

    const nextWave = stateRef.current.wave + 1;
    setGameState(prev => ({ ...prev, wave: nextWave, isPlaying: true }));
    
    const count = 5 + Math.floor(nextWave * 1.5);
    const types: EnemyType[] = [];
    
    if (nextWave % 5 === 0) types.push(EnemyType.BOSS);
    if (nextWave > 2) types.push(EnemyType.TRIANGLE);
    if (nextWave > 5) types.push(EnemyType.CIRCLE);
    if (nextWave > 8) types.push(EnemyType.DIAMOND);
    if (types.length === 0) types.push(EnemyType.SQUARE); 

    const queue: EnemyType[] = [];
    for(let i=0; i<count; i++) {
        queue.push(types[Math.floor(Math.random() * types.length)]);
    }

    enemiesToSpawnRef.current = queue;
    waveConfigRef.current = {
        count,
        interval: Math.max(200, 1000 - nextWave * 50),
        types,
        hpMultiplier: 1 + (nextWave * 0.2)
    };
  };

  const performAutoUpgrades = () => {
      let currentMoney = stateRef.current.money;
      let upgradesHappened = false;
      const newTowers = new Map<string, TowerEntity>(towersRef.current);

      newTowers.forEach((tower, key) => {
          if (tower.autoUpgrade) {
              const config = TOWER_STATS[tower.type];
              const cost = Math.floor(config.cost * 0.5 * tower.level);
              
              if (currentMoney >= cost) {
                  currentMoney -= cost;
                  newTowers.set(key, {
                      ...tower,
                      level: tower.level + 1,
                      damage: Math.floor(tower.damage * 1.3),
                      range: tower.range * 1.05
                  });
                  upgradesHappened = true;
              }
          }
      });

      if (upgradesHappened) {
          setGameState(prev => ({ ...prev, money: currentMoney }));
          setTowers(newTowers);
      }
  };

  // --- MAIN LOOP ---
  const animate = (time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Auto Upgrade Check (Every 1s)
    if (time - autoUpgradeTimerRef.current > 1000) {
        performAutoUpgrades();
        autoUpgradeTimerRef.current = time;
    }

    // Auto Wave Logic
    if (!stateRef.current.isPlaying && !stateRef.current.isGameOver && stateRef.current.autoWave && stateRef.current.wave > 0) {
         if (waveEndTimeRef.current > 0 && time > waveEndTimeRef.current + 1000) { 
             startNextWave();
             waveEndTimeRef.current = 0; 
         }
    }

    if (stateRef.current.isPlaying && !stateRef.current.isGameOver) {
      const dt = Math.min(deltaTime, 50) * stateRef.current.gameSpeed; 

      if (enemiesToSpawnRef.current.length > 0) {
        if (time > nextSpawnTimeRef.current) {
          const nextEnemy = enemiesToSpawnRef.current.shift();
          if (nextEnemy) spawnEnemy(nextEnemy);
          nextSpawnTimeRef.current = time + (waveConfigRef.current?.interval || 1000);
        }
      } else if (enemiesRef.current.length === 0 && stateRef.current.wave > 0) {
        setGameState(prev => ({ ...prev, isPlaying: false }));
        waveEndTimeRef.current = time; 
      }

      const now = Date.now();
      const newProjectiles: Projectile[] = [];

      towersRef.current.forEach((tower) => {
        if (now - tower.lastFired >= tower.cooldown / stateRef.current.gameSpeed) {
          let target: EnemyEntity | null = null;
          let minDist = Infinity;

          for (const enemy of enemiesRef.current) {
             const dx = (enemy.worldPos.x - tower.gridPos.x);
             const dy = (enemy.worldPos.y - tower.gridPos.y);
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist <= tower.range && dist < minDist) {
                 minDist = dist;
                 target = enemy;
             }
          }

          if (target) {
            tower.lastFired = now;
            newProjectiles.push({
                id: uuid(),
                startPos: { ...tower.gridPos },
                targetPos: { ...target.worldPos },
                progress: 0,
                speed: 0.05 * stateRef.current.gameSpeed,
                color: TOWER_STATS[tower.type].color,
                damage: tower.damage,
                aoe: tower.type === TowerType.AOE ? 1.5 : 0
            });
          }
        }
      });

      if (newProjectiles.length > 0) {
          setProjectiles(prev => [...prev, ...newProjectiles]);
      }

      setProjectiles(prev => {
          const active: Projectile[] = [];
          const enemiesToHit: {id: string, damage: number, freeze?: boolean}[] = [];

          prev.forEach(p => {
              p.progress += p.speed;
              if (p.progress >= 1) {
                  enemiesRef.current.forEach(e => {
                      const dx = e.worldPos.x - p.targetPos.x;
                      const dy = e.worldPos.y - p.targetPos.y;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      const hitRadius = p.aoe || 0.5;

                      if (dist < hitRadius) {
                          enemiesToHit.push({ id: e.id, damage: p.damage });
                      }
                  });
              } else {
                  active.push(p);
              }
          });

          if (enemiesToHit.length > 0) {
             setEnemies(prevEnemies => {
                 const updated = prevEnemies.map(e => {
                     const hits = enemiesToHit.filter(h => h.id === e.id);
                     if (hits.length === 0) return e;
                     const totalDamage = hits.reduce((sum, h) => sum + h.damage, 0);
                     return { ...e, hp: e.hp - totalDamage };
                 }).filter(e => {
                     if (e.hp <= 0) {
                         setGameState(gs => ({...gs, money: gs.money + e.value}));
                         return false;
                     }
                     return true;
                 });
                 return updated;
             });
          }

          return active;
      });

      setEnemies(prev => {
        let livesLost = 0;
        const updated = prev.map(enemy => {
            const speed = (enemy.speed / 60) * stateRef.current.gameSpeed; 
            let newProgress = enemy.progress + speed;

            let newWorldPos = { ...enemy.worldPos };
            let newGridPos = enemy.gridPos;
            let nextGridPos = enemy.nextGridPos;

            if (nextGridPos) {
                newWorldPos.x = enemy.gridPos.x + (nextGridPos.x - enemy.gridPos.x) * newProgress;
                newWorldPos.y = enemy.gridPos.y + (nextGridPos.y - enemy.gridPos.y) * newProgress;
            }

            if (newProgress >= 1) {
                if (nextGridPos) {
                    newGridPos = nextGridPos;
                    newWorldPos = nextGridPos;
                }
                
                if (newGridPos.x >= GRID_W - 1) {
                    livesLost++;
                    return null;
                }

                const key = posKey(newGridPos);
                const flowTarget = flowFieldRef.current.get(key);
                
                if (flowTarget) {
                    nextGridPos = flowTarget;
                } else {
                    nextGridPos = { x: newGridPos.x + 1, y: newGridPos.y };
                }
                
                newProgress = 0;
            }

            return {
                ...enemy,
                gridPos: newGridPos,
                nextGridPos: nextGridPos,
                worldPos: newWorldPos,
                progress: newProgress
            };
        }).filter(Boolean) as EnemyEntity[];

        if (livesLost > 0) {
            setGameState(gs => {
                const newLives = gs.lives - livesLost;
                if (newLives <= 0) return { ...gs, lives: 0, isGameOver: true, isPlaying: false };
                return { ...gs, lives: newLives };
            });
        }

        return updated;
      });

    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- RENDER HELPERS (SKINS) ---
  
  const renderTowerSkin = (type: TowerType) => {
    switch (type) {
        case TowerType.BASIC: // Cannon
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 shadow-lg relative flex items-center justify-center">
                        <div className="absolute w-10 h-3 bg-slate-950 rounded-r-md -right-2 top-1/2 -translate-y-1/2 border border-slate-700" />
                        <div className="w-4 h-4 rounded-full bg-slate-500 border border-slate-400 z-10" />
                    </div>
                </div>
            );
        case TowerType.RAPID: // Machine Gun
             return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-sm bg-amber-900 border-2 border-amber-700 shadow-lg relative flex items-center justify-center transform rotate-45">
                        {/* Barrels */}
                        <div className="absolute w-1 h-6 bg-black -top-3 left-2" />
                        <div className="absolute w-1 h-6 bg-black -top-3 right-2" />
                        <div className="absolute w-1 h-6 bg-black -left-3 top-2 rotate-90" />
                        <div className="absolute w-1 h-6 bg-black -right-3 top-2 rotate-90" />
                        <div className="w-5 h-5 rounded-full bg-amber-600 border border-amber-400 z-10" />
                    </div>
                </div>
            );
        case TowerType.SNIPER: // Sniper
             return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-10 h-1.5 bg-black -right-2 top-1/2 -translate-y-1/2" />
                    <div className="w-7 h-7 rotate-45 bg-emerald-900 border-2 border-emerald-600 z-10 flex items-center justify-center shadow-lg">
                        <Crosshair size={14} className="text-emerald-400" />
                    </div>
                </div>
            );
        case TowerType.AOE: // Ice Tower
             return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-full h-full absolute animate-pulse bg-cyan-500/20 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-cyan-900 border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center z-10">
                        <Snowflake size={16} className="text-cyan-200" />
                    </div>
                </div>
            );
        default:
            return null;
    }
  };

  const renderIconForButton = (type: TowerType) => {
     switch(type) {
         case TowerType.BASIC: return <Target size={20} className="text-slate-300" />;
         case TowerType.RAPID: return <Zap size={20} className="text-amber-400" />;
         case TowerType.SNIPER: return <Crosshair size={20} className="text-emerald-400" />;
         case TowerType.AOE: return <Snowflake size={20} className="text-cyan-400" />;
     }
  }

  // --- INTERACTION ---

  const handleCellClick = (x: number, y: number) => {
    if (stateRef.current.isGameOver) return;
    if (x === 0 || x === GRID_W - 1) return;

    const key = posKey({ x, y });
    const existingTower = towers.get(key);

    if (existingTower) {
        setSelectedCell({ x, y });
        setBuildMode(null);
        return;
    }

    if (buildMode) {
        const config = TOWER_STATS[buildMode];
        if (stateRef.current.money < config.cost) return; 

        const isOccupiedByEnemy = enemies.some(e => 
            Math.abs(e.worldPos.x - x) < 0.8 && Math.abs(e.worldPos.y - y) < 0.8
        );
        if (isOccupiedByEnemy) return; 

        const ranges = getWaveRanges(stateRef.current.wave);
        if (isPlacementValid(towers as any, { x, y }, ranges.spawn, ranges.exit)) {
            setGameState(prev => ({ ...prev, money: prev.money - config.cost }));
            
            setTowers(prev => {
                const newMap = new Map<string, TowerEntity>(prev);
                newMap.set(key, {
                    id: uuid(),
                    gridPos: { x, y },
                    type: buildMode,
                    level: 1,
                    damage: config.damage,
                    range: config.range,
                    cooldown: config.cooldown,
                    lastFired: 0,
                    targetId: null,
                    totalKills: 0,
                    autoUpgrade: false
                });
                return newMap;
            });
        }
    } else {
        setSelectedCell(null);
    }
  };

  const handleSellTower = () => {
      if (!selectedCell) return;
      const key = posKey(selectedCell);
      const tower = towers.get(key);
      if (tower) {
          const config = TOWER_STATS[tower.type];
          const refund = Math.floor(config.cost * 0.7); 
          setGameState(prev => ({ ...prev, money: prev.money + refund }));
          setTowers(prev => {
              const newMap = new Map<string, TowerEntity>(prev);
              newMap.delete(key);
              return newMap;
          });
          setSelectedCell(null);
      }
  };

  const handleUpgradeTower = () => {
    if (!selectedCell) return;
    const key = posKey(selectedCell);
    const tower = towers.get(key);
    if (tower) {
        const upgradeCost = Math.floor(TOWER_STATS[tower.type].cost * 0.5 * tower.level);
        if (gameState.money >= upgradeCost) {
            setGameState(prev => ({ ...prev, money: prev.money - upgradeCost }));
            setTowers(prev => {
                const newMap = new Map<string, TowerEntity>(prev);
                const t = newMap.get(key)!;
                newMap.set(key, {
                    ...t,
                    level: t.level + 1,
                    damage: Math.floor(t.damage * 1.3),
                    range: t.range * 1.05
                });
                return newMap;
            });
        }
    }
  };

  const toggleTowerAutoUpgrade = () => {
      if (!selectedCell) return;
      const key = posKey(selectedCell);
      setTowers(prev => {
          const newMap = new Map<string, TowerEntity>(prev);
          const t = newMap.get(key)!;
          newMap.set(key, { ...t, autoUpgrade: !t.autoUpgrade });
          return newMap;
      });
  };

  const restartGame = () => {
      setGameState({
        money: START_MONEY,
        lives: START_LIVES,
        wave: 0,
        isPlaying: false,
        isGameOver: false,
        gameSpeed: 1,
        autoWave: false,
      });
      setTowers(new Map());
      setEnemies([]);
      setProjectiles([]);
      enemiesToSpawnRef.current = [];
      waveEndTimeRef.current = 0;
  };

  const renderGrid = () => {
    const cells = [];
    const ranges = getWaveRanges(gameState.wave);
    const hasActiveWave = gameState.wave > 0;

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const key = posKey({ x, y });
        const tower = towers.get(key);
        const isSelected = selectedCell?.x === x && selectedCell?.y === y;
        
        const isSpawn = hasActiveWave && x === 0 && y >= ranges.spawn.min && y <= ranges.spawn.max;
        const isExit = hasActiveWave && x === GRID_W - 1 && y >= ranges.exit.min && y <= ranges.exit.max;
        
        cells.push(
          <div
            key={key}
            onClick={() => handleCellClick(x, y)}
            className={`
              absolute border transition-colors duration-150 cursor-pointer
              ${tower ? 'z-10' : 'z-0'}
              ${isSelected ? 'ring-2 ring-white z-20' : ''}
              ${isSpawn ? 'bg-green-900/20 border-green-500/30' : isExit ? 'bg-red-900/20 border-red-500/30' : 'border-slate-600/50 bg-slate-800/60 hover:bg-slate-700/80'}
            `}
            style={{ width: CELL_SIZE, height: CELL_SIZE, left: x * CELL_SIZE, top: y * CELL_SIZE }}
          >
            {isSpawn && <div className="absolute inset-0 flex items-center justify-center opacity-40 text-[8px] font-bold text-green-500 pointer-events-none">IN</div>}
            {isExit && <div className="absolute inset-0 flex items-center justify-center opacity-40 text-[8px] font-bold text-red-500 pointer-events-none">OUT</div>}

            {tower && (
              <div className={`w-full h-full pointer-events-none p-0.5`}>
                  {renderTowerSkin(tower.type)}
                  
                  {/* Level Badge */}
                  <div className="absolute -top-1 -right-1 bg-black text-[9px] font-bold px-1.5 py-0 rounded text-white border border-slate-600 shadow z-20">
                        {tower.level}
                  </div>
                  {/* Auto Upgrade Badge */}
                  {tower.autoUpgrade && (
                         <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[8px] p-0.5 rounded-full z-20 border border-black">
                             <ArrowUpCircle size={8} />
                         </div>
                    )}
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-row w-full h-screen items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* LEFT SIDEBAR - STATS & CONTROLS */}
      {/* Reduced width from 80px to 64px, and added shrink-0 */}
      <div className="w-[64px] h-full shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between items-center py-4 z-30 shadow-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* TOP GROUP: TITLE & STATS */}
          <div className="flex flex-col items-center gap-2 w-full shrink-0">
            {/* TITLE - Compact */}
            <div className="font-black text-[10px] text-center leading-none text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 mt-1 mb-2">
                TD<br/>DAVI
            </div>

            {/* STATS - Compact */}
            <div className="flex flex-col gap-2 w-full items-center">
                <div className="flex flex-col items-center group">
                    <Heart size={16} className="text-red-500 mb-0.5" fill="currentColor" />
                    <span className="text-[9px] font-mono font-bold">{Math.floor(gameState.lives)}</span>
                </div>
                <div className="flex flex-col items-center group">
                    <Coins size={16} className="text-yellow-500 mb-0.5" fill="currentColor" />
                    <span className="text-[9px] font-mono font-bold">${Math.floor(gameState.money)}</span>
                </div>
                <div className="flex flex-col items-center group">
                    <Shield size={16} className="text-blue-500 mb-0.5" fill="currentColor" />
                    <span className="text-[9px] font-mono font-bold">{gameState.wave}</span>
                </div>
            </div>
          </div>

          {/* BOTTOM GROUP: CONTROLS */}
          <div className="flex flex-col gap-2 w-full px-1.5 pb-2 shrink-0">
              <button 
                  onClick={() => setGameState(p => ({...p, autoWave: !p.autoWave}))}
                  className={`w-full aspect-square rounded-md flex flex-col items-center justify-center transition-all ${gameState.autoWave ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                  title="Auto Wave"
              >
                  <RotateCcw size={20} className={gameState.autoWave ? 'animate-spin-slow' : ''} />
              </button>

              {!gameState.isPlaying && !gameState.isGameOver ? (
                  <button 
                      onClick={startNextWave}
                      className="w-full aspect-square rounded-md flex flex-col items-center justify-center bg-green-600 text-white hover:bg-green-500 shadow-lg animate-pulse"
                      title="Start Wave"
                  >
                      <Play size={20} fill="currentColor" />
                  </button>
              ) : (
                  <div className="w-full aspect-square rounded-md flex flex-col items-center justify-center bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed">
                      <Play size={20} />
                  </div>
              )}

              <button 
                  onClick={() => setGameState(p => ({...p, gameSpeed: p.gameSpeed === 1 ? 2 : p.gameSpeed === 2 ? 4 : 1}))}
                  className="w-full aspect-square rounded-md flex flex-col items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 relative"
                  title="Game Speed"
              >
                  <FastForward size={20} />
                  <span className="absolute bottom-0 right-0 text-[8px] bg-slate-950 px-1 rounded-tl-sm border-t border-l border-slate-700 leading-tight font-bold text-white">
                    {gameState.gameSpeed}x
                  </span>
              </button>
          </div>
      </div>

      {/* MIDDLE - GAME AREA */}
      <div className="flex-1 h-full relative overflow-hidden bg-slate-950">
          <div 
            ref={containerRef}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"
          >
             {/* Board Container with Absolute Centering */}
             <div 
                className="absolute left-1/2 top-1/2 shadow-2xl border border-slate-800 transition-transform duration-200 ease-out"
                style={{ 
                    width: GRID_W * CELL_SIZE, 
                    height: GRID_H * CELL_SIZE,
                    // Center the element by its own size, then scale it. 
                    // This ensures correct centering regardless of the container flexbox behavior.
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: 'center' 
                }}
             >
                {renderGrid()}

                {/* ENEMIES */}
                {enemies.map(enemy => (
                    <div
                        key={enemy.id}
                        className="absolute flex items-center justify-center pointer-events-none will-change-transform"
                        style={{
                            width: CELL_SIZE * 0.6, height: CELL_SIZE * 0.6,
                            left: 0, top: 0,
                            transform: `translate(${enemy.worldPos.x * CELL_SIZE + CELL_SIZE * 0.2}px, ${enemy.worldPos.y * CELL_SIZE + CELL_SIZE * 0.2}px)`
                        }}
                    >
                        <div className={`w-full h-full shadow-[0_0_8px_currentColor]`}
                            style={{ 
                                backgroundColor: ENEMY_STATS[enemy.type].color,
                                color: ENEMY_STATS[enemy.type].color,
                                clipPath: enemy.type === EnemyType.TRIANGLE ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                          enemy.type === EnemyType.CIRCLE ? 'circle(50% at 50% 50%)' :
                                          enemy.type === EnemyType.DIAMOND ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none'
                            }}
                        />
                        <div className="absolute -top-3 left-0 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-100" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                        </div>
                    </div>
                ))}

                {/* PROJECTILES */}
                {projectiles.map(proj => {
                     const cx = proj.startPos.x * CELL_SIZE + CELL_SIZE/2 + (proj.targetPos.x * CELL_SIZE + CELL_SIZE/2 - (proj.startPos.x * CELL_SIZE + CELL_SIZE/2)) * proj.progress;
                     const cy = proj.startPos.y * CELL_SIZE + CELL_SIZE/2 + (proj.targetPos.y * CELL_SIZE + CELL_SIZE/2 - (proj.startPos.y * CELL_SIZE + CELL_SIZE/2)) * proj.progress;
                     return (
                        <div key={proj.id} className={`absolute w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] pointer-events-none`}
                            style={{ backgroundColor: proj.color, color: proj.color, left: cx - 4, top: cy - 4 }}
                        />
                     );
                })}
             </div>
          </div>
      </div>

      {/* RIGHT SIDEBAR - TOWER MENU ONLY */}
      <div className="w-[64px] h-full shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 z-30 shadow-2xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* CONTEXT MENU (BUILD or EDIT) */}
            <div className="flex flex-col gap-3 w-full px-1.5 flex-1">
                {selectedCell ? (
                    // EDIT MODE
                    (() => {
                        const key = posKey(selectedCell);
                        const tower = towers.get(key);
                        if (!tower) { setSelectedCell(null); return null; }
                        const config = TOWER_STATS[tower.type];
                        const upgradeCost = Math.floor(config.cost * 0.5 * tower.level);
                        const canUpgrade = gameState.money >= upgradeCost;

                        return (
                            <div className="flex flex-col gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                                <div className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-widest">EDIT</div>
                                
                                <div className={`w-full aspect-square rounded-md flex items-center justify-center bg-slate-800 shadow-inner mb-1`}>
                                     {renderIconForButton(tower.type)}
                                </div>
                                
                                <button 
                                    onClick={handleUpgradeTower}
                                    disabled={!canUpgrade}
                                    className={`w-full aspect-square rounded-md flex flex-col items-center justify-center border transition-all ${canUpgrade ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 opacity-50'}`}
                                    title={`Upgrade $${upgradeCost}`}
                                >
                                    <ArrowUpCircle size={20} />
                                    <span className="text-[8px] font-bold mt-0.5">${upgradeCost}</span>
                                </button>

                                <button 
                                    onClick={toggleTowerAutoUpgrade}
                                    className={`w-full aspect-square rounded-md flex flex-col items-center justify-center border transition-all ${tower.autoUpgrade ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                    title="Auto Upgrade"
                                >
                                    <RefreshCw size={20} className={tower.autoUpgrade ? 'animate-spin-slow' : ''} />
                                    <span className="text-[8px] font-bold mt-0.5">AUTO</span>
                                </button>

                                <button
                                    onClick={handleSellTower}
                                    className="w-full aspect-square rounded-md flex flex-col items-center justify-center bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50"
                                    title="Sell"
                                >
                                    <Trash2 size={20} />
                                    <span className="text-[8px] font-bold mt-0.5">SELL</span>
                                </button>

                                <button onClick={() => setSelectedCell(null)} className="mt-auto w-full py-2 text-slate-500 hover:text-white flex justify-center">
                                    <X size={20} />
                                </button>
                            </div>
                        )
                    })()
                ) : (
                    // BUILD MODE
                    <>
                        <div className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-widest mb-1">BUILD</div>
                        {Object.values(TowerType).map((type) => {
                            const config = TOWER_STATS[type];
                            const canAfford = gameState.money >= config.cost;
                            const isActive = buildMode === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => { setBuildMode(isActive ? null : type); setSelectedCell(null); }}
                                    disabled={!canAfford}
                                    className={`
                                        w-full aspect-square rounded-md flex flex-col items-center justify-center border transition-all relative
                                        ${isActive ? 'bg-slate-700 border-white ring-1 ring-white/50 z-10' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}
                                        ${!canAfford ? 'opacity-40 grayscale' : ''}
                                    `}
                                    title={`${config.name} ($${config.cost})`}
                                >
                                    <div className="mb-0.5">
                                        {renderIconForButton(type)}
                                    </div>
                                    <span className="text-[8px] text-yellow-400 font-mono font-bold">${config.cost}</span>
                                </button>
                            )
                        })}
                    </>
                )}
            </div>
      </div>

      {/* GAME OVER OVERLAY */}
      {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center flex-col p-6 animate-in fade-in duration-300">
              <ShieldAlert size={64} className="text-red-500 mb-4" />
              <h2 className="text-4xl font-black text-red-500 mb-2 tracking-wider">GAME OVER</h2>
              <p className="text-slate-300 text-lg mb-8">Waves Survived: <span className="text-white font-bold">{gameState.wave}</span></p>
              <button 
                onClick={restartGame}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg"
              >
                  <RefreshCw size={20} /> Try Again
              </button>
          </div>
      )}
    </div>
  );
}