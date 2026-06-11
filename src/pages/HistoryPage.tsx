import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Trophy, Skull, Calendar } from 'lucide-react';
import type { BattleRecord } from '../types/pokemon';
import { sound } from '../utils/sound';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<BattleRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pokemon_battle_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse history records', e);
    }
  }, []);

  const handleClearHistory = () => {
    sound.playSelect();
    if (window.confirm('모든 전적 기록을 초기화하시겠습니까?')) {
      localStorage.removeItem('pokemon_battle_history');
      setHistory([]);
    }
  };

  const handleBack = () => {
    sound.playSelect();
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-2xl w-full mx-auto justify-center select-none font-outfit">
      
      {/* Header bar */}
      <header className="flex justify-between items-center mb-8 border-b-2 border-slate-800 pb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border-2 border-slate-800 hover:border-poke-yellow text-slate-400 hover:text-poke-yellow rounded-md cursor-pointer transition text-xs font-pixel shadow-pixel"
        >
          <ArrowLeft size={12} />
          돌아가기
        </button>

        <h1 className="text-lg md:text-xl font-bold font-pixel text-slate-100 tracking-wider">
          배틀 전적 기록
        </h1>

        {history.length > 0 ? (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-md cursor-pointer transition text-xs font-pixel shadow-pixel"
          >
            <Trash2 size={12} />
            초기화
          </button>
        ) : (
          <div className="w-20" /> // Spacer to balance
        )}
      </header>

      {/* Main Records List */}
      <main className="flex-1 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/40 border-2 border-slate-800 p-10 rounded-md shadow-pixel">
            <span className="text-5xl mb-4 block animate-bounce">⚔️</span>
            <h2 className="font-pixel text-[10px] text-slate-400 mb-2">기록된 배틀이 없습니다</h2>
            <p className="text-xs text-slate-500 mt-2">
              포켓몬을 선택하고 첫 번째 배틀을 시작하세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => {
              const isWin = record.result === 'WIN';

              return (
                <div
                  key={record.id}
                  className={`flex flex-col sm:flex-row justify-between items-center bg-poke-card border-2 p-4 rounded-md shadow-pixel transition duration-150 ${
                    isWin ? 'border-amber-500/40 hover:border-amber-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left Section: Date and Status Badges */}
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                    <div className={`p-2.5 rounded-full border ${
                      isWin ? 'bg-amber-950/30 border-amber-500 text-amber-500' : 'bg-slate-950/50 border-slate-700 text-slate-400'
                    }`}>
                      {isWin ? <Trophy size={18} /> : <Skull size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-pixel text-[9px] font-black ${
                          isWin ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {isWin ? 'WIN' : 'LOSE'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-pixel text-[8px] flex items-center gap-1">
                          <Calendar size={10} /> {record.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-pixel text-[8px] tracking-wide">
                        {record.turnsCount} 턴 대치
                      </p>
                    </div>
                  </div>

                  {/* Right Section: Matchup Visualizer */}
                  <div className="flex items-center justify-center gap-6 w-full sm:w-auto bg-slate-950/40 border border-slate-800 px-4 py-2 rounded-md">
                    {/* Player Pokemon */}
                    <div className="flex flex-col items-center">
                      <img
                        src={record.playerPokemonSprite}
                        alt={record.playerPokemonName}
                        className="w-10 h-10 pixelated filter drop-shadow"
                      />
                      <span className="font-pixel text-[7px] text-slate-300 mt-1">
                        {record.playerPokemonName}
                      </span>
                    </div>

                    <span className="font-pixel text-[8px] text-rose-500 animate-pulse">VS</span>

                    {/* Enemy Pokemon */}
                    <div className="flex flex-col items-center">
                      <img
                        src={record.enemyPokemonSprite}
                        alt={record.enemyPokemonName}
                        className="w-10 h-10 pixelated filter drop-shadow"
                      />
                      <span className="font-pixel text-[7px] text-slate-300 mt-1">
                        {record.enemyPokemonName}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
};
