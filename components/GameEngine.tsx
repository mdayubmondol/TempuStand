
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, EntityType, GameStats } from '../types';
import { Info, X, Coins, Calendar, Users, Briefcase, TrendingDown, Handshake, ShieldAlert } from 'lucide-react';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  PLAYER_SIZE, 
  TEMPU_SIZE, 
  NPC_SIZE, 
  SPAWN_RATES,
  COLORS,
  LANES
} from '../constants';

const playSound = (type: 'COIN' | 'HIT' | 'TAX' | 'SIREN') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'COIN') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.1, now); osc.start(); osc.stop(now + 0.1);
    } else if (type === 'HIT') {
      osc.type = 'square'; osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.2, now); osc.start(); osc.stop(now + 0.2);
    } else if (type === 'SIREN') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.05, now); osc.start(); osc.stop(now + 0.8);
    }
  } catch (e) {}
};

interface GameEngineProps {
  onGameOver: (stats: GameStats) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Added initial value 0 to useRef<number> to satisfy "Expected 1 arguments, but got 0" error.
  const requestRef = useRef<number>(0);
  const [screenShake, setScreenShake] = useState(0);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [wantedLevel, setWantedLevel] = useState(0);
  
  const roadOffsetRef = useRef(0);
  const playerLaneRef = useRef<number>(1);
  const playerTargetYRef = useRef<number>(GAME_HEIGHT - 170);
  
  const playerRef = useRef<Entity>({
    id: 'player', type: 'PLAYER', x: LANES[1] - PLAYER_SIZE / 2, y: GAME_HEIGHT - 170,
    width: PLAYER_SIZE, height: PLAYER_SIZE, vx: 0, vy: 0, speed: 0.25 
  });

  const entitiesRef = useRef<Entity[]>([]);
  const statsRef = useRef<GameStats>({
    totalMoney: 0, totalShared: 0, tempuCount: 0, publicHitCount: 0, leaderMetCount: 0, daysSurvived: 0
  });

  const [uiStats, setUiStats] = useState<GameStats>(statsRef.current);
  const lastSpawnRef = useRef<Record<string, number>>({});
  const lastDayRef = useRef<number>(Date.now());
  const floatingTextsRef = useRef<{x: number, y: number, text: string, color: string, life: number}[]>([]);

  const spawnEntity = useCallback((type: EntityType) => {
    const id = Math.random().toString(36).substr(2, 9);
    const laneIndex = Math.floor(Math.random() * 3);
    const x = LANES[laneIndex] - (type === 'TEMPU' ? TEMPU_SIZE/2 : NPC_SIZE/2);
    const y = -300;
    
    // Difficulty adjusts by days and wanted level
    const diff = 1 + (statsRef.current.daysSurvived / 40) + (wantedLevel * 0.2);
    const speed = (type === 'TEMPU' ? 6 : (type === 'POLICE' ? 14 : 5 + Math.random() * 5)) * diff;

    entitiesRef.current.push({
      id, type, x, y,
      width: type === 'TEMPU' ? TEMPU_SIZE : NPC_SIZE,
      height: type === 'TEMPU' ? TEMPU_SIZE * 1.6 : NPC_SIZE,
      vx: 0, vy: speed, speed
    });
    if (type === 'POLICE') playSound('SIREN');
  }, [wantedLevel]);

  const update = useCallback(() => {
    if (isStatsOpen) return;
    roadOffsetRef.current = (roadOffsetRef.current + 10) % 100;
    const player = playerRef.current;
    
    // Movement
    player.x += (LANES[playerLaneRef.current] - player.width / 2 - player.x) * 0.3;
    player.y += (playerTargetYRef.current - player.y) * 0.2;
    player.y = Math.max(150, Math.min(GAME_HEIGHT - 120, player.y));

    const now = Date.now();
    // Spawning logic - Police rate depends on wanted level
    const spawnRateMultiplier = Math.max(0.2, 1 - (statsRef.current.daysSurvived / 100));
    
    Object.entries(SPAWN_RATES).forEach(([type, rate]) => {
      let finalRate = rate * spawnRateMultiplier;
      if (type === 'POLICE') finalRate /= (1 + wantedLevel);
      
      if (!lastSpawnRef.current[type] || now - lastSpawnRef.current[type] > finalRate) {
        spawnEntity(type as EntityType);
        lastSpawnRef.current[type] = now;
      }
    });

    if (now - lastDayRef.current > 2000) {
      statsRef.current.daysSurvived += 1;
      lastDayRef.current = now;
      setUiStats({ ...statsRef.current });
    }

    const nextEntities: Entity[] = [];
    entitiesRef.current.forEach(e => {
      e.y += e.vy;
      const collided = player.x < e.x + e.width && player.x + player.width > e.x &&
                       player.y < e.y + e.height && player.y + player.height > e.y;

      if (collided) {
        if (e.type === 'TEMPU') {
          statsRef.current.totalMoney += 30;
          statsRef.current.tempuCount += 1;
          playSound('COIN');
          floatingTextsRef.current.push({ x: e.x, y: e.y, text: '+৳৩০', color: COLORS.TEMPU, life: 60 });
        } else if (e.type === 'LEADER') {
          const cut = Math.floor(statsRef.current.totalMoney * 0.15);
          statsRef.current.totalMoney -= cut;
          statsRef.current.totalShared += cut;
          statsRef.current.leaderMetCount += 1;
          playSound('TAX');
          setScreenShake(15); setTimeout(() => setScreenShake(0), 100);
          floatingTextsRef.current.push({ x: e.x, y: e.y, text: `-৳${cut}`, color: COLORS.LEADER, life: 60 });
        } else if (e.type === 'PUBLIC') {
          statsRef.current.publicHitCount += 1;
          setWantedLevel(prev => Math.min(5, prev + 0.5));
          playSound('HIT');
          setScreenShake(20); setTimeout(() => setScreenShake(0), 150);
        } else if (e.type === 'POLICE') {
          onGameOver(statsRef.current);
          return;
        }
        setUiStats({ ...statsRef.current });
        return; // Entity disappears on collision
      }
      if (e.y < GAME_HEIGHT + 300) nextEntities.push(e);
    });

    entitiesRef.current = nextEntities;
    floatingTextsRef.current = floatingTextsRef.current.map(t => ({ ...t, y: t.y - 4, life: t.life - 1 })).filter(t => t.life > 0);
  }, [onGameOver, spawnEntity, isStatsOpen, wantedLevel]);

  const drawCharacter = (ctx: CanvasRenderingContext2D, e: Entity) => {
    const { x, y, width, height, type } = e;
    const centerX = x + width / 2;
    ctx.save();
    if (type === 'TEMPU') {
      ctx.fillStyle = COLORS.TEMPU;
      ctx.beginPath(); ctx.roundRect(x, y, width, height, 15); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(x + 5, y + 10, width - 10, 30);
    } else {
      ctx.fillStyle = COLORS[type];
      ctx.beginPath(); ctx.arc(centerX, y + height/2, width/2, 0, Math.PI * 2); ctx.fill();
      if (type === 'PLAYER') {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
      }
    }
    ctx.restore();
  };

  const loop = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      update();
      ctx.save();
      if (screenShake > 0) ctx.translate(Math.random()*screenShake, Math.random()*screenShake);
      ctx.fillStyle = COLORS.STREET;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Lane markings
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -roadOffsetRef.current * 2;
      [GAME_WIDTH/3, 2*GAME_WIDTH/3].forEach(lx => {
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, GAME_HEIGHT); ctx.stroke();
      });

      entitiesRef.current.forEach(e => drawCharacter(ctx, e));
      drawCharacter(ctx, playerRef.current);
      
      floatingTextsRef.current.forEach(t => {
        ctx.fillStyle = t.color; ctx.font = '900 30px "Hind Siliguri"';
        ctx.fillText(t.text, t.x, t.y);
      });
      ctx.restore();
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [update, screenShake]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  const handleTouch = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touchX = e.touches[0].clientX - rect.left;
    playerLaneRef.current = Math.floor((touchX / rect.width) * 3);
    playerTargetYRef.current = e.touches[0].clientY - rect.top;
  };

  return (
    <div className="relative w-full h-full touch-none select-none">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} onTouchMove={handleTouch} onTouchStart={handleTouch} className="w-full h-full object-cover" />
      
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-black/80 backdrop-blur px-6 py-3 rounded-2xl border-2 border-yellow-500 shadow-lg">
            <div className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">কালেকশন</div>
            <div className="text-white text-3xl font-black">৳{uiStats.totalMoney}</div>
          </div>
          {wantedLevel > 0 && (
            <div className="flex gap-1 animate-pulse">
              {Array.from({length: Math.ceil(wantedLevel)}).map((_, i) => (
                <ShieldAlert key={i} className="w-6 h-6 text-red-500 fill-red-500" />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-black/80 backdrop-blur px-6 py-3 rounded-2xl border-2 border-cyan-500 shadow-lg text-center">
          <div className="text-cyan-500 text-[10px] font-black uppercase tracking-widest">দিন</div>
          <div className="text-white text-3xl font-black">{uiStats.daysSurvived}</div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <p className="bg-black/60 px-6 py-2 rounded-full text-white/80 text-xs font-bold uppercase tracking-widest">স্ক্রিনে আঙুল দিয়ে সরান</p>
      </div>
    </div>
  );
};

export default GameEngine;
