import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { sound } from '../utils/sound';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    sound.playSelect();
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center select-none font-outfit">
      <div className="max-w-md w-full bg-slate-900 border-4 border-slate-700 p-8 rounded-lg shadow-pixel text-center flex flex-col items-center select-none">
        
        {/* Animated Cute Bulbasaur Sprite */}
        <div className="w-28 h-28 bg-slate-950/80 border-2 border-slate-800 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
            alt="Bulbasaur"
            className="w-24 h-24 pixelated animate-bounce"
            style={{ animationDuration: '2.5s' }}
          />
        </div>

        <h2 className="font-pixel text-[11px] text-poke-yellow mb-2 tracking-widest animate-pulse">
          야생 에러가 나타났다!
        </h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          요청하신 페이지가 수풀 속에 숨었거나 존재하지 않습니다. 포켓볼을 던져 탈출하세요!
        </p>

        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-poke-yellow border-2 border-yellow-300 text-slate-950 font-pixel text-[9px] font-extrabold rounded-md cursor-pointer transition shadow-pixel hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <Home size={10} />
          연구소로 돌아가기
        </button>

      </div>
    </div>
  );
};
