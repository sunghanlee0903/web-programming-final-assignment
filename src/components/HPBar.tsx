import React from 'react';
import { motion } from 'framer-motion';

interface HPBarProps {
  current: number;
  max: number;
}

export const HPBar: React.FC<HPBarProps> = ({ current, max }) => {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  // Determine HP bar color dynamically based on GBA rule (Green > 50%, Orange > 20%, Red <= 20%)
  const getColorClass = (percent: number) => {
    if (percent > 50) return 'bg-emerald-500 shadow-[0_2px_0_#065f46]';
    if (percent > 20) return 'bg-amber-400 shadow-[0_2px_0_#92400e]';
    return 'bg-rose-500 shadow-[0_2px_0_#9f1239]';
  };

  return (
    <div className="w-full">
      {/* HP Label and Numeric display */}
      <div className="flex justify-between items-center mb-1 font-pixel text-[10px] tracking-tight">
        <span className="text-amber-300 font-bold">HP</span>
        <span className="text-slate-300">
          {current}/{max}
        </span>
      </div>

      {/* HP Bar container with double-bordered retro look */}
      <div className="w-full h-4 bg-slate-900 border-2 border-slate-700 p-0.5 rounded-sm overflow-hidden flex items-stretch">
        <motion.div
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-sm ${getColorClass(percentage)}`}
        />
      </div>
    </div>
  );
};
