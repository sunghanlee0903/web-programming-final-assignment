import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface BattleLogProps {
  logs: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const currentMessage = logs.length > 0 ? logs[logs.length - 1] : '전투가 시작됩니다!';
  const typedMessage = useTypewriter(currentMessage, 20);

  return (
    <div className="w-full h-full min-h-[100px] flex items-center justify-between bg-slate-900 border-4 border-double border-slate-700 p-4 font-pixel text-xs leading-relaxed text-slate-100 tracking-wider relative select-none crt-effect">
      {/* Typewriter message */}
      <div className="flex-1 pr-6 font-semibold">
        {typedMessage}
      </div>

      {/* Blinking red pointer arrow in the bottom right corner (Classic retro gaming style) */}
      {typedMessage === currentMessage && (
        <div className="absolute right-4 bottom-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500 animate-bounce" />
      )}
    </div>
  );
};
