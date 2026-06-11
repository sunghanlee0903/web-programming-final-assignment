import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon } from '../types/pokemon';
import { HPBar } from './HPBar';
import { getTypeNameKorean } from '../utils/pokemonMapper';
import { sound } from '../utils/sound';
import { useBattleStore } from '../store/battleStore';

const BallSVG: React.FC<{ type: 'pokeball' | 'greatball' | 'ultraball'; className?: string }> = ({ type, className }) => {
  if (type === 'greatball') {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1e293b" strokeWidth="2" />
        <path d="M2 12h20" stroke="#1e293b" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" />
        <path d="M5 6.5a10 10 0 0 1 3.5-3" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 6.5a10 10 0 0 0 -3.5-3" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="#fff" stroke="#1e293b" strokeWidth="2" />
        <circle cx="12" cy="12" r="1" fill="#fff" />
      </svg>
    );
  }
  if (type === 'ultraball') {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1e293b" strokeWidth="2" />
        <path d="M2 12h20" stroke="#1e293b" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
        <path d="M6 12V6.5a10 10 0 0 1 12 0V12" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="#fff" stroke="#1e293b" strokeWidth="2" />
        <circle cx="12" cy="12" r="1" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1e293b" strokeWidth="2" />
      <path d="M2 12h20" stroke="#1e293b" strokeWidth="2" />
      <path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z" fill="#ef4444" stroke="#1e293b" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#fff" stroke="#1e293b" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="#fff" />
    </svg>
  );
};

interface BattleFieldProps {
  playerPokemon: Pokemon;
  enemyPokemon: Pokemon;
  playerHP: number;
  enemyHP: number;
  playerMaxHP: number;
  enemyMaxHP: number;
  playerLevel: number;
  enemyLevel: number;
  activeAnimation: {
    type: 'player-attack' | 'enemy-attack' | 'player-damage' | 'enemy-damage' | null;
    moveName?: string;
  };
}

export const BattleField: React.FC<BattleFieldProps> = ({
  playerPokemon,
  enemyPokemon,
  playerHP,
  enemyHP,
  playerMaxHP,
  enemyMaxHP,
  playerLevel,
  enemyLevel,
  activeAnimation,
}) => {
  const usedBall = useBattleStore((state) => state.usedBall);

  const [releaseState, setReleaseState] = useState<'hidden' | 'roll' | 'wiggle' | 'open' | 'released'>('hidden');

  useEffect(() => {
    setReleaseState('roll');

    const wiggleTimer = setTimeout(() => {
      setReleaseState('wiggle');
      sound.playTone(300, 'triangle', 0.08, 0, 0.04);
    }, 800);

    const openTimer = setTimeout(() => {
      setReleaseState('open');
      sound.playTone(600, 'sine', 0.15, 0, 0.08);
    }, 1400);

    const releaseTimer = setTimeout(() => {
      setReleaseState('released');
    }, 1800);

    return () => {
      clearTimeout(wiggleTimer);
      clearTimeout(openTimer);
      clearTimeout(releaseTimer);
    };
  }, []);

  // Determine animation states
  const isPlayerAttacking = activeAnimation.type === 'player-attack';
  const isEnemyAttacking = activeAnimation.type === 'enemy-attack';
  const isPlayerDamaged = activeAnimation.type === 'player-damage';
  const isEnemyDamaged = activeAnimation.type === 'enemy-damage';

  // Animation variants
  const playerVariants: any = {
    idle: { x: 0, y: 0, scale: 1, filter: 'brightness(1) saturate(1)' },
    attack: {
      x: [0, 40, -10, 0],
      y: [0, -30, 5, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    damage: {
      x: [0, -10, 10, -8, 8, -5, 5, 0],
      filter: ['brightness(1) red(0)', 'brightness(1.5) sepia(1) saturate(10000%) hue-rotate(-50deg)', 'brightness(1)'],
      transition: { duration: 0.6 },
    },
  };

  const enemyVariants: any = {
    idle: { x: 0, y: 0, scale: 1 },
    attack: {
      x: [0, -40, 10, 0],
      y: [0, 30, -5, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    damage: {
      x: [0, -10, 10, -8, 8, -5, 5, 0],
      filter: ['brightness(1) red(0)', 'brightness(1.5) sepia(1) saturate(10000%) hue-rotate(-50deg)', 'brightness(1)'],
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="w-full aspect-[4/3] bg-[#0c101f] border-4 border-slate-700 relative overflow-hidden rounded-md select-none crt-effect">
      
      {/* 3D Perspective Battle Ground Ground Decal */}
      <div className="absolute bottom-0 left-0 right-0 h-[64%] bg-gradient-to-b from-[#1b233a] to-[#0c0f1b] border-t-2 border-slate-800 z-0 overflow-hidden pointer-events-none select-none">
        {/* Grid perspective lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:16px_16px] opacity-35" />

        {/* Giant Center Pokeball Decal (skewed for 3D perspective!) */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-32 border-4 border-[#ffcc01]/25 rounded-full flex items-center justify-center transform scale-y-[0.4] rotate-[-12deg] opacity-45">
          <div className="w-full h-1 bg-[#ffcc01]/25 absolute top-1/2 -translate-y-1/2" />
          <div className="w-16 h-16 border-4 border-[#ffcc01]/30 bg-[#0c0f1b] rounded-full z-10 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#ffcc01]/30 rounded-full" />
          </div>
        </div>

        {/* White Boundary Rings */}
        <div className="absolute bottom-4 left-6 w-32 h-14 border-2 border-slate-500/25 rounded-full transform scale-y-[0.3] rotate-[-10deg] opacity-45" />
        <div className="absolute top-4 right-6 w-28 h-12 border-2 border-slate-500/25 rounded-full transform scale-y-[0.3] rotate-[-10deg] opacity-45" />

        {/* Ground sand textures */}
        <div className="absolute bottom-0 left-0 right-0 h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-[0.03]" />
      </div>

      {/* Majestic Stadium Searchlight Beams (Pulsing mix-blend light beams!) */}
      <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden mix-blend-screen">
        <div className="absolute -top-10 -left-10 w-44 h-80 bg-gradient-to-br from-indigo-500/10 via-sky-400/5 to-transparent origin-top-left transform rotate-[25deg] blur-[2px] animate-pulse" style={{ animationDuration: '3.5s' }} />
        <div className="absolute -top-10 -right-10 w-44 h-80 bg-gradient-to-bl from-indigo-500/10 via-sky-400/5 to-transparent origin-top-right transform rotate-[-25deg] blur-[2px] animate-pulse" style={{ animationDuration: '4.5s' }} />
      </div>

      {/* Spectator Stands Audience Background Layer (z-0, opacity-65) */}
      <div className="absolute top-0 left-0 right-0 h-[36%] border-b-2 border-slate-800 bg-[#0c101f] overflow-hidden flex flex-col justify-end pointer-events-none z-0 opacity-65 select-none">
        
        {/* Stadium Flash Lights Row */}
        <div className="absolute top-1 left-0 right-0 flex justify-around px-4">
          <span className="w-1 h-1 bg-sky-400 rounded-full animate-ping" />
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          <span className="w-1 h-1 bg-rose-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </div>

        {/* Tiered spectator stands populated with animated dots */}
        <div className="flex flex-col gap-0.5 w-full pb-1">
          
          {/* Upper Tier 1 */}
          <div className="flex justify-center gap-1 px-6 opacity-75 scale-90">
            {Array.from({ length: 14 }).map((_, i) => {
              const colors = ['bg-rose-500', 'bg-sky-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];
              const color = colors[i % colors.length];
              const anim = (i % 3 === 0) ? 'animate-audience-1' : (i % 3 === 1) ? 'animate-audience-2' : 'animate-audience-3';
              return (
                <div key={i} className={`w-2.5 h-3.5 rounded-t-full border border-slate-950 flex flex-col items-center justify-start ${color} ${anim}`}>
                  <div className="w-1 h-1 bg-white/80 rounded-full mt-0.5" />
                </div>
              );
            })}
          </div>

          {/* Lower Tier 2 */}
          <div className="flex justify-center gap-1.5 px-4 border-t border-slate-900 pt-0.5">
            {Array.from({ length: 16 }).map((_, i) => {
              const colors = ['bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-violet-500', 'bg-yellow-500', 'bg-indigo-500'];
              const color = colors[(i + 2) % colors.length];
              const anim = (i % 3 === 0) ? 'animate-audience-3' : (i % 3 === 1) ? 'animate-audience-1' : 'animate-audience-2';
              return (
                <div key={i} className={`w-3 h-4 rounded-t-full border border-slate-950 flex flex-col items-center justify-start ${color} ${anim}`}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Fence row */}
        <div className="w-full h-1.5 bg-slate-800 border-t border-slate-900 relative">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#334155_3px,#334155_6px)] opacity-40" />
        </div>
      </div>

      {/* ==================== 1. ENEMY POKEMON SECTION (TOP RIGHT) ==================== */}
      <div className="absolute top-[8%] right-[8%] w-[48%] flex flex-col items-center">
        {/* Enemy Sprite & Oval Platform Shadow */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* GBA Grass Oval Platform */}
          <div className="absolute bottom-2 w-32 h-8 bg-gradient-to-r from-emerald-900/60 via-teal-800/80 to-emerald-950/60 rounded-full border border-teal-600/30 blur-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform -scale-y-50" />
          
          <motion.img
            src={enemyPokemon.sprites.front_default}
            alt={enemyPokemon.koreanName}
            variants={enemyVariants}
            animate={isEnemyAttacking ? 'attack' : isEnemyDamaged ? 'damage' : 'idle'}
            className="w-32 h-32 pixelated z-10 filter drop-shadow-[0_8px_4px_rgba(0,0,0,0.4)]"
          />

          {/* Floating Attack Move Text Overlay */}
          <AnimatePresence>
            {isEnemyAttacking && activeAnimation.moveName && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-4 bg-rose-950/90 border-2 border-rose-500 text-rose-300 font-pixel text-[8px] py-1 px-2 rounded-sm shadow-pixel z-30"
              >
                {activeAnimation.moveName}!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== 2. ENEMY STATUS BOX (TOP LEFT) ==================== */}
      <div className="absolute top-[8%] left-[6%] w-[40%] bg-slate-900/90 border-2 border-slate-700 p-2.5 rounded shadow-pixel backdrop-blur-sm z-20">
        <div className="flex justify-between items-end mb-1">
          <span className="font-pixel text-[10px] font-bold text-slate-100 uppercase tracking-tight">
            {enemyPokemon.koreanName}
          </span>
          <span className="font-pixel text-[8px] font-semibold text-rose-400">
            Lv{enemyLevel}
          </span>
        </div>
        
        {/* Type badges */}
        <div className="flex gap-1 mb-2">
          {enemyPokemon.types.map(t => (
            <span key={t} className="px-1 text-[7px] font-pixel text-slate-300 bg-slate-800/80 rounded uppercase">
              {getTypeNameKorean(t)}
            </span>
          ))}
        </div>

        {/* HP Bar */}
        <HPBar current={enemyHP} max={enemyMaxHP} />
      </div>

      {/* ==================== 3. PLAYER POKEMON SECTION (BOTTOM LEFT) ==================== */}
      <div className="absolute bottom-[6%] left-[8%] w-[48%] flex flex-col items-center">
        {/* Player Sprite & Oval GBA Platform */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* GBA Dirt Oval Platform */}
          <div className="absolute bottom-2 w-40 h-10 bg-gradient-to-r from-amber-950/50 via-yellow-900/60 to-amber-950/50 rounded-full border border-amber-800/30 blur-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform -scale-y-50" />
          
          {/* Release state components */}
          {releaseState !== 'released' ? (
            <div className="absolute inset-0 flex items-center justify-center z-15 select-none pointer-events-none">
              {/* The Pokeball itself */}
              {(releaseState === 'roll' || releaseState === 'wiggle') && (
                <motion.div
                  initial={releaseState === 'roll' ? { x: -120, y: -40, rotate: -360, scale: 0.4 } : undefined}
                  animate={
                    releaseState === 'roll' 
                      ? { x: 0, y: 0, rotate: 0, scale: 1 } 
                      : { rotate: [-15, 15, -10, 10, -5, 5, 0] }
                  }
                  transition={
                    releaseState === 'roll' 
                      ? { type: 'spring', bounce: 0.35, duration: 0.75 } 
                      : { duration: 0.5, ease: 'easeInOut' }
                  }
                  className="w-8 h-8 flex items-center justify-center mt-12"
                >
                  <BallSVG type={usedBall} className="w-8 h-8 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
                </motion.div>
              )}

              {/* The Open Flash Light Beam Effect */}
              {releaseState === 'open' && (
                <div className="relative w-full h-full flex items-center justify-center mt-12">
                  {/* Outer burst glow */}
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 1.8, 1.2], opacity: [0, 1, 0.8] }}
                    className={`absolute w-16 h-16 rounded-full blur-[8px] ${
                      usedBall === 'greatball' 
                        ? 'bg-blue-400/80 shadow-[0_0_35px_#3b82f6]' 
                        : usedBall === 'ultraball'
                          ? 'bg-yellow-400/80 shadow-[0_0_35px_#fbbf24]'
                          : 'bg-white/90 shadow-[0_0_30px_#fff]'
                    }`}
                  />
                  {/* Inner flash beam */}
                  <motion.div
                    initial={{ scaleX: 0.1, scaleY: 0.1, opacity: 0 }}
                    animate={{ scaleX: [0.1, 2.5, 0], scaleY: [0.1, 2.5, 0], opacity: [0, 1, 0] }}
                    className={`absolute w-12 h-12 rounded-full ${
                      usedBall === 'greatball'
                        ? 'bg-sky-200'
                        : usedBall === 'ultraball'
                          ? 'bg-amber-100'
                          : 'bg-white'
                    }`}
                  />
                  {/* Sparkle/particle burst */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i * 30 * Math.PI) / 180;
                      const distance = 40 + Math.random() * 20;
                      const targetX = Math.cos(angle) * distance;
                      const targetY = Math.sin(angle) * distance;
                      const particleColor = usedBall === 'greatball' 
                        ? 'bg-blue-300 shadow-[0_0_4px_#3b82f6]' 
                        : usedBall === 'ultraball'
                          ? 'bg-yellow-300 shadow-[0_0_4px_#eab308]'
                          : 'bg-white shadow-[0_0_3px_#fff]';
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                          animate={{ x: targetX, y: targetY, scale: 0.1, opacity: 0 }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          className={`absolute w-1.5 h-1.5 rounded-full ${particleColor}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.img
              src={playerPokemon.sprites.back_default}
              alt={playerPokemon.koreanName}
              variants={playerVariants}
              animate={isPlayerAttacking ? 'attack' : isPlayerDamaged ? 'damage' : 'idle'}
              initial={{ scale: 0, filter: 'brightness(3.5) saturate(0)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-40 h-40 pixelated z-10 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]"
            />
          )}

          {/* Floating Attack Move Text Overlay */}
          <AnimatePresence>
            {isPlayerAttacking && activeAnimation.moveName && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: -40, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-4 bg-sky-950/90 border-2 border-sky-500 text-sky-300 font-pixel text-[8px] py-1 px-2 rounded-sm shadow-pixel z-30"
              >
                {activeAnimation.moveName}!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== 4. PLAYER STATUS BOX (BOTTOM RIGHT) ==================== */}
      <div className="absolute bottom-[10%] right-[6%] w-[40%] bg-slate-900/90 border-2 border-slate-700 p-2.5 rounded shadow-pixel backdrop-blur-sm z-20">
        <div className="flex justify-between items-end mb-1">
          <div className="flex items-center gap-1">
            <span className="font-pixel text-[10px] font-bold text-amber-300 uppercase tracking-tight">
              {playerPokemon.koreanName}
            </span>
          </div>
          <span className="font-pixel text-[8px] font-semibold text-sky-400">
            Lv{playerLevel}
          </span>
        </div>

        {/* Type badges */}
        <div className="flex gap-1 mb-2">
          {playerPokemon.types.map(t => (
            <span key={t} className="px-1 text-[7px] font-pixel text-slate-300 bg-slate-800/80 rounded uppercase">
              {getTypeNameKorean(t)}
            </span>
          ))}
        </div>

        {/* HP Bar */}
        <HPBar current={playerHP} max={playerMaxHP} />
      </div>
    </div>
  );
};
