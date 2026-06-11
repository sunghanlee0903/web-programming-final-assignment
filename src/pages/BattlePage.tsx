import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, LogOut, ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBattleStore } from '../store/battleStore';
import { BattleField } from '../components/BattleField';
import { BattleActions } from '../components/BattleActions';
import { BattleLog } from '../components/BattleLog';
import { sound } from '../utils/sound';

export const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    playerPokemon,
    enemyPokemon,
    playerHP,
    enemyHP,
    playerMaxHP,
    enemyMaxHP,
    turn,
    phase,
    battleLog,
    isAnimating,
    activeAnimation,
    winner,
    playerAttack,
    enemyAttack,
    resetBattle,
    initBattle,
    playerLevel,
    enemyLevel,
    earnedExp,
    expBefore,
    expAfter,
    leveledUp,
    gold,
    earnedGold,
  } = useBattleStore();

  const [isMuted, setIsMuted] = useState<boolean>(sound.getMutedStatus());
  const [resultExpPct, setResultExpPct] = useState(0);

  // EXP bar filling animation on battle end
  useEffect(() => {
    if (phase === 'result' && playerPokemon) {
      const prevLevel = leveledUp ? playerLevel - 1 : playerLevel;
      const prevReqExp = prevLevel * 100;
      const startPct = (expBefore / prevReqExp) * 100;
      const endPct = leveledUp ? 100 : (expAfter / (playerLevel * 100)) * 100;

      // Initialize at previous EXP level
      setResultExpPct(startPct);

      // Animate smoothly to new EXP level after short delay
      const timer = setTimeout(() => {
        setResultExpPct(endPct);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResultExpPct(0);
    }
  }, [phase, playerPokemon, expBefore, expAfter, playerLevel, leveledUp]);

  // 1. Redirection fallback if loaded directly without selection
  useEffect(() => {
    if (!playerPokemon || !enemyPokemon) {
      navigate('/');
    }
  }, [playerPokemon, enemyPokemon, navigate]);

  // 2. Trigger AI turn automatically
  useEffect(() => {
    if (phase === 'battle' && turn === 'enemy' && !isAnimating) {
      const timer = setTimeout(() => {
        enemyAttack();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, phase, isAnimating, enemyAttack]);

  // 3. Trigger victory confetti
  useEffect(() => {
    if (phase === 'result' && winner === 'player') {
      // Confetti double burst for impressive visual wow factor
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffcc01', '#ff5722', '#4caf50', '#00bcd4']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffcc01', '#ff5722', '#4caf50', '#00bcd4']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [phase, winner]);

  if (!playerPokemon || !enemyPokemon) {
    return null;
  }

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleRetreat = () => {
    sound.playSelect();
    resetBattle();
    navigate('/');
  };

  const handleRestartSame = () => {
    sound.playSelect();
    // Restart with same Pokemons
    initBattle(playerPokemon, enemyPokemon);
  };

  const isPlayerTurn = phase === 'battle' && turn === 'player' && !isAnimating;

  return (
    <div className="flex-1 flex flex-col p-6 max-w-4xl w-full mx-auto justify-center select-none font-outfit relative">
      
      {/* Upper header navigation bar */}
      <header className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
        <button
          onClick={handleRetreat}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border-2 border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-md cursor-pointer transition text-xs font-pixel shadow-pixel"
        >
          <LogOut size={12} />
          도망치기 (RUN)
        </button>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-2 bg-slate-900 border-2 border-slate-800 hover:border-poke-yellow text-slate-400 hover:text-poke-yellow rounded-md cursor-pointer transition shadow-pixel"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </header>

      {/* Main Battle Field Display Arena */}
      <main className="w-full mb-6">
        <BattleField
          playerPokemon={playerPokemon}
          enemyPokemon={enemyPokemon}
          playerHP={playerHP}
          enemyHP={enemyHP}
          playerMaxHP={playerMaxHP}
          enemyMaxHP={enemyMaxHP}
          playerLevel={playerLevel}
          enemyLevel={enemyLevel}
          activeAnimation={activeAnimation}
        />
      </main>

      {/* Lower Dashboard Controller (Classic GBA layout) */}
      <footer className="w-full h-36">
        <div className="grid grid-cols-5 gap-4 h-full">
          
          {/* If it's the player's active move choice turn */}
          {isPlayerTurn ? (
            <>
              {/* Left 3/5: Move options grid */}
              <div className="col-span-3">
                <BattleActions
                  pokemon={playerPokemon}
                  onMoveSelect={playerAttack}
                  disabled={isAnimating}
                />
              </div>
              
              {/* Right 2/5: Interactive tip box explaining battle stats */}
              <div className="col-span-2 bg-slate-900 border-4 border-double border-slate-700 p-3 flex flex-col justify-between font-pixel text-[8px] text-slate-300 leading-normal rounded-sm crt-effect">
                <div>
                  <p className="text-poke-yellow font-bold mb-1.5 uppercase">
                    무엇을 할까?
                  </p>
                  <p className="text-slate-400">
                    기술을 선택하여 상대 {enemyPokemon.koreanName}를 공격하세요. 상성 데미지가 적용됩니다.
                  </p>
                </div>
                <div className="text-right text-[7px] text-slate-500 font-bold uppercase border-t border-slate-800 pt-1">
                  TYPE: {playerPokemon.types.join(' / ')}
                </div>
              </div>
            </>
          ) : (
            /* If animating, enemy turn, or results: full length dialogue box */
            <div className="col-span-5">
              <BattleLog logs={battleLog} />
            </div>
          )}

        </div>
      </footer>

      {/* ==================== 5. BATTLE RESULT MODAL OVERLAY ==================== */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center backdrop-blur-md p-6 z-50 rounded-lg ${
              winner === 'player' ? 'bg-emerald-950/45' : 'bg-slate-950/70'
            }`}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="max-w-md w-full bg-slate-900 border-4 border-slate-700 p-8 rounded-lg shadow-pixelGlow text-center flex flex-col items-center select-none"
            >
              {winner === 'player' ? (
                <>
                  <span className="text-5xl mb-4 animate-bounce">🏆</span>
                  <h2 className="text-xl font-black font-pixel text-poke-yellow mb-2 tracking-widest animate-pulse">
                    VICTORY!
                  </h2>
                  <p className="text-sm text-slate-300 font-semibold mb-5">
                    배틀에서 멋지게 승리했습니다!
                  </p>
                  
                  {/* EXP Gain Display & Animated EXP Bar */}
                  <div className="w-full bg-slate-950/60 p-3.5 rounded border border-slate-800 mb-5 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-pixel text-[8px] text-slate-400 font-bold">EXP GAINED</span>
                      <span className="font-pixel text-[9px] text-indigo-400 font-black">+{earnedExp} EXP</span>
                    </div>
                    
                    {/* Exp Bar */}
                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-[1200ms] ease-out"
                        style={{ width: `${resultExpPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[7px] font-pixel text-slate-500 font-bold">
                      <span>Lv.{leveledUp ? playerLevel - 1 : playerLevel}</span>
                      <span>
                        {leveledUp && resultExpPct === 100 ? (
                          <span className="text-yellow-400 font-black animate-pulse">MAX!</span>
                        ) : (
                          `${expAfter} / ${playerLevel * 100} XP`
                        )}
                      </span>
                      <span>Lv.{playerLevel}</span>
                    </div>

                    {leveledUp && (
                      <div className="mt-3 text-center py-1.5 bg-yellow-500/20 border-2 border-double border-yellow-400 text-yellow-300 font-pixel text-[9px] font-black rounded animate-bounce shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                        ★ LEVEL UP! Lv.{playerLevel - 1} ➔ Lv.{playerLevel} ★
                      </div>
                    )}

                    {/* Gold Reward Section */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col gap-1 select-none">
                      <div className="flex justify-between items-center text-[9px] font-pixel text-amber-400 font-black">
                        <span className="flex items-center gap-1">🪙 GOLD EARNED</span>
                        <span>+{earnedGold} GOLD</span>
                      </div>
                      <div className="flex justify-between items-center text-[7px] font-pixel text-slate-500 font-bold">
                        <span>TOTAL BALANCE</span>
                        <span>{gold} GOLD</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-pixel text-slate-500 bg-slate-950/60 py-2 px-4 rounded border border-slate-800 mb-6 w-full">
                    {playerPokemon.koreanName}의 활약으로<br />
                    상대 {enemyPokemon.koreanName}을(를) 제압했습니다.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-5xl mb-4 grayscale">💀</span>
                  <h2 className="text-xl font-black font-pixel text-rose-500 mb-2 tracking-widest">
                    DEFEATED...
                  </h2>
                  <p className="text-sm text-slate-300 font-semibold mb-5">
                    눈앞이 캄캄해졌습니다!
                  </p>

                  {/* EXP Gain Display & Animated EXP Bar (Even on Defeat!) */}
                  <div className="w-full bg-slate-950/60 p-3.5 rounded border border-slate-800 mb-5 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-pixel text-[8px] text-slate-400 font-bold">EXP GAINED</span>
                      <span className="font-pixel text-[9px] text-indigo-400 font-black">+{earnedExp} EXP</span>
                    </div>
                    
                    {/* Exp Bar */}
                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-[1200ms] ease-out"
                        style={{ width: `${resultExpPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[7px] font-pixel text-slate-500 font-bold">
                      <span>Lv.{leveledUp ? playerLevel - 1 : playerLevel}</span>
                      <span>
                        {leveledUp && resultExpPct === 100 ? (
                          <span className="text-yellow-400 font-black animate-pulse">MAX!</span>
                        ) : (
                          `${expAfter} / ${playerLevel * 100} XP`
                        )}
                      </span>
                      <span>Lv.{playerLevel}</span>
                    </div>

                    {leveledUp && (
                      <div className="mt-3 text-center py-1.5 bg-yellow-500/20 border-2 border-double border-yellow-400 text-yellow-300 font-pixel text-[9px] font-black rounded animate-bounce shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                        ★ LEVEL UP! Lv.{playerLevel - 1} ➔ Lv.{playerLevel} ★
                      </div>
                    )}

                    {/* Gold Reward Section */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col gap-1 select-none">
                      <div className="flex justify-between items-center text-[9px] font-pixel text-amber-400 font-black">
                        <span className="flex items-center gap-1">🪙 GOLD EARNED</span>
                        <span>+{earnedGold} GOLD</span>
                      </div>
                      <div className="flex justify-between items-center text-[7px] font-pixel text-slate-500 font-bold">
                        <span>TOTAL BALANCE</span>
                        <span>{gold} GOLD</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-pixel text-slate-500 bg-slate-950/60 py-2 px-4 rounded border border-slate-800 mb-6 w-full">
                    상대 {enemyPokemon.koreanName}의 공격에<br />
                    아쉽게도 패배했습니다.
                  </p>
                </>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleRestartSame}
                  className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-700 hover:border-poke-yellow text-slate-200 hover:text-poke-yellow font-pixel text-[9px] rounded-md cursor-pointer transition shadow-pixel hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={10} />
                  재도전 (RETRY)
                </button>
                
                <button
                  onClick={handleRetreat}
                  className="flex-1 px-4 py-3 bg-poke-yellow border-2 border-yellow-300 hover:bg-yellow-400 text-slate-950 font-pixel text-[9px] font-extrabold rounded-md cursor-pointer transition shadow-pixel hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={10} />
                  처음으로 (EXIT)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
