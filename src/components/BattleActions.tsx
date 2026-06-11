import React from 'react';
import type { Pokemon, Move } from '../types/pokemon';

interface BattleActionsProps {
  pokemon: Pokemon;
  onMoveSelect: (move: Move) => void;
  disabled: boolean;
}

const typeColorMap: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: 'bg-[#A8A77A]/10 hover:bg-[#A8A77A]/20', text: 'text-[#A8A77A]', border: 'border-[#A8A77A]/40 hover:border-[#A8A77A]' },
  fire: { bg: 'bg-[#EE8130]/10 hover:bg-[#EE8130]/20', text: 'text-[#EE8130]', border: 'border-[#EE8130]/40 hover:border-[#EE8130]' },
  water: { bg: 'bg-[#6390F0]/10 hover:bg-[#6390F0]/20', text: 'text-[#6390F0]', border: 'border-[#6390F0]/40 hover:border-[#6390F0]' },
  electric: { bg: 'bg-[#F7D02C]/10 hover:bg-[#F7D02C]/20', text: 'text-[#F7D02C]', border: 'border-[#F7D02C]/40 hover:border-[#F7D02C]' },
  grass: { bg: 'bg-[#7AC74C]/10 hover:bg-[#7AC74C]/20', text: 'text-[#7AC74C]', border: 'border-[#7AC74C]/40 hover:border-[#7AC74C]' },
  ice: { bg: 'bg-[#96D9D6]/10 hover:bg-[#96D9D6]/20', text: 'text-[#96D9D6]', border: 'border-[#96D9D6]/40 hover:border-[#96D9D6]' },
  fighting: { bg: 'bg-[#C22E28]/10 hover:bg-[#C22E28]/20', text: 'text-[#C22E28]', border: 'border-[#C22E28]/40 hover:border-[#C22E28]' },
  poison: { bg: 'bg-[#A33EA1]/10 hover:bg-[#A33EA1]/20', text: 'text-[#A33EA1]', border: 'border-[#A33EA1]/40 hover:border-[#A33EA1]' },
  ground: { bg: 'bg-[#E2BF65]/10 hover:bg-[#E2BF65]/20', text: 'text-[#E2BF65]', border: 'border-[#E2BF65]/40 hover:border-[#E2BF65]' },
  flying: { bg: 'bg-[#A98FF3]/10 hover:bg-[#A98FF3]/20', text: 'text-[#A98FF3]', border: 'border-[#A98FF3]/40 hover:border-[#A98FF3]' },
  psychic: { bg: 'bg-[#F95587]/10 hover:bg-[#F95587]/20', text: 'text-[#F95587]', border: 'border-[#F95587]/40 hover:border-[#F95587]' },
  bug: { bg: 'bg-[#A6B91A]/10 hover:bg-[#A6B91A]/20', text: 'text-[#A6B91A]', border: 'border-[#A6B91A]/40 hover:border-[#A6B91A]' },
  rock: { bg: 'bg-[#B6A136]/10 hover:bg-[#B6A136]/20', text: 'text-[#B6A136]', border: 'border-[#B6A136]/40 hover:border-[#B6A136]' },
  ghost: { bg: 'bg-[#735797]/10 hover:bg-[#735797]/20', text: 'text-[#735797]', border: 'border-[#735797]/40 hover:border-[#735797]' },
  dragon: { bg: 'bg-[#6F35FC]/10 hover:bg-[#6F35FC]/20', text: 'text-[#6F35FC]', border: 'border-[#6F35FC]/40 hover:border-[#6F35FC]' },
  dark: { bg: 'bg-[#705746]/10 hover:bg-[#705746]/20', text: 'text-[#705746]', border: 'border-[#705746]/40 hover:border-[#705746]' },
  steel: { bg: 'bg-[#B7B7CE]/10 hover:bg-[#B7B7CE]/20', text: 'text-[#B7B7CE]', border: 'border-[#B7B7CE]/40 hover:border-[#B7B7CE]' },
  fairy: { bg: 'bg-[#D685AD]/10 hover:bg-[#D685AD]/20', text: 'text-[#D685AD]', border: 'border-[#D685AD]/40 hover:border-[#D685AD]' },
};

export const BattleActions: React.FC<BattleActionsProps> = ({ pokemon, onMoveSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full select-none">
      {pokemon.moves.map((move) => {
        const colors = typeColorMap[move.type.toLowerCase()] || typeColorMap.normal;
        
        return (
          <button
            key={move.name}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                onMoveSelect(move);
              }
            }}
            className={`flex flex-col justify-between items-start p-3 text-left border-2 rounded-md font-pixel cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 shadow-pixel ${colors.bg} ${colors.border}`}
          >
            {/* Move Name */}
            <span className={`text-[11px] font-bold tracking-wide ${colors.text}`}>
              {move.koreanName}
            </span>

            {/* Move Info */}
            <div className="flex justify-between items-end w-full mt-2 text-[9px] text-slate-400">
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-[8px] uppercase tracking-wider">
                {move.type}
              </span>
              <span className="font-semibold">
                PP {move.pp}/{move.maxPp}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
