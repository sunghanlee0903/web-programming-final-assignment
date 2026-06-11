import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Swords, Zap, Heart, Search, Volume2, VolumeX, History, Sparkles, Lock } from 'lucide-react';
import { fetchSinglePokemon } from '../hooks/usePokemon';
import { useBattleStore } from '../store/battleStore';
import { sound } from '../utils/sound';
import { pokemonKoreanNames, getTypeNameKorean } from '../utils/pokemonMapper';
import type { Pokemon } from '../types/pokemon';
import { 
  getPlayerPokemonState, 
  getRequiredExpForNextLevel, 
  getPlayerGold, 
  getUnlockedPokemonIds, 
  drawRandomPokemon,
  MAX_POKEMON_COUNT,
  getPokemonRarity,
  getGachaDrawCount,
  getEpicTickets,
  getBallInventory,
  getEquippedBall,
  saveEquippedBall,
  buyBall,
  buyRareCandy
} from '../utils/levelStorage';
import type { BallInventory } from '../utils/levelStorage';

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

const typeBgColors: Record<string, string> = {
  normal: 'border-[#A8A77A] text-[#A8A77A] bg-[#A8A77A]/10',
  fire: 'border-[#EE8130] text-[#EE8130] bg-[#EE8130]/10',
  water: 'border-[#6390F0] text-[#6390F0] bg-[#6390F0]/10',
  electric: 'border-[#F7D02C] text-[#F7D02C] bg-[#F7D02C]/10',
  grass: 'border-[#7AC74C] text-[#7AC74C] bg-[#7AC74C]/10',
  ice: 'border-[#96D9D6] text-[#96D9D6] bg-[#96D9D6]/10',
  fighting: 'border-[#C22E28] text-[#C22E28] bg-[#C22E28]/10',
  poison: 'border-[#A33EA1] text-[#A33EA1] bg-[#A33EA1]/10',
  ground: 'border-[#E2BF65] text-[#E2BF65] bg-[#E2BF65]/10',
  flying: 'border-[#A98FF3] text-[#A98FF3] bg-[#A98FF3]/10',
  psychic: 'border-[#F95587] text-[#F95587] bg-[#F95587]/10',
  bug: 'border-[#A6B91A] text-[#A6B91A] bg-[#A6B91A]/10',
  rock: 'border-[#B6A136] text-[#B6A136] bg-[#B6A136]/10',
  ghost: 'border-[#735797] text-[#735797] bg-[#735797]/10',
  dragon: 'border-[#6F35FC] text-[#6F35FC] bg-[#6F35FC]/10',
  dark: 'border-[#705746] text-[#705746] bg-[#705746]/10',
  steel: 'border-[#B7B7CE] text-[#B7B7CE] bg-[#B7B7CE]/10',
  fairy: 'border-[#D685AD] text-[#D685AD] bg-[#D685AD]/10',
};

const rarityBadges: Record<'normal' | 'rare' | 'epic' | 'legendary', { label: string; style: string }> = {
  normal: { label: '일반', style: 'bg-slate-700/85 text-slate-100 border-slate-600' },
  rare: { label: '레어', style: 'bg-blue-600/85 text-blue-100 border-blue-500' },
  epic: { label: '에픽', style: 'bg-purple-600/85 text-purple-100 border-purple-500' },
  legendary: { label: '전설', style: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse' }
};

const gachaRarityStyles: Record<'normal' | 'rare' | 'epic' | 'legendary', {
  modalBorder: string;
  modalShadow: string;
  glowBg: string;
  subText: string;
  subBorder: string;
  portalBorder: string;
  portalBg: string;
  spriteGlow: string;
  shadowBg: string;
  btnStyle: string;
}> = {
  normal: {
    modalBorder: 'border-slate-500',
    modalShadow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]',
    glowBg: 'bg-slate-400/5',
    subText: 'text-slate-400',
    subBorder: 'border-slate-800',
    portalBorder: 'border-slate-800/60',
    portalBg: 'from-slate-950 via-slate-900 to-slate-950',
    spriteGlow: 'drop-shadow-[0_8px_8px_rgba(255,255,255,0.25)]',
    shadowBg: 'bg-slate-400/20',
    btnStyle: 'bg-slate-700 border-slate-500 hover:bg-slate-600 text-slate-100'
  },
  rare: {
    modalBorder: 'border-blue-500',
    modalShadow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    glowBg: 'bg-blue-500/10',
    subText: 'text-blue-300',
    subBorder: 'border-blue-900/50',
    portalBorder: 'border-blue-900/60',
    portalBg: 'from-slate-950 via-[#0d2149] to-slate-950',
    spriteGlow: 'drop-shadow-[0_8px_8px_rgba(59,130,246,0.5)]',
    shadowBg: 'bg-blue-600/40',
    btnStyle: 'bg-blue-600 border-blue-400 hover:bg-blue-700 text-slate-100'
  },
  epic: {
    modalBorder: 'border-purple-500',
    modalShadow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    glowBg: 'bg-purple-500/10',
    subText: 'text-purple-300',
    subBorder: 'border-purple-900/50',
    portalBorder: 'border-purple-900/60',
    portalBg: 'from-slate-950 via-[#22123a] to-slate-950',
    spriteGlow: 'drop-shadow-[0_8px_8px_rgba(168,85,247,0.5)]',
    shadowBg: 'bg-purple-600/40',
    btnStyle: 'bg-purple-600 border-purple-400 hover:bg-purple-700 text-slate-100'
  },
  legendary: {
    modalBorder: 'border-amber-500',
    modalShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.55)]',
    glowBg: 'bg-amber-500/15',
    subText: 'text-amber-300',
    subBorder: 'border-amber-900/50',
    portalBorder: 'border-amber-500/40',
    portalBg: 'from-slate-950 via-[#3a220c] to-slate-950',
    spriteGlow: 'drop-shadow-[0_8px_8px_rgba(245,158,11,0.65)]',
    shadowBg: 'bg-amber-500/45',
    btnStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 text-slate-950 font-black hover:from-amber-605 hover:to-orange-605'
  }
};

export const SelectPage: React.FC = () => {
  const navigate = useNavigate();
  const initBattle = useBattleStore((state) => state.initBattle);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [battleStarting, setBattleStarting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMutedStatus());

  // Gacha & Summons States
  const [unlockedIds, setUnlockedIds] = useState<number[]>(getUnlockedPokemonIds());
  const [gold, setGold] = useState<number>(getPlayerGold());
  const [gachaResult, setGachaResult] = useState<Pokemon | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showRates, setShowRates] = useState<boolean>(false);
  const [drawCount, setDrawCount] = useState<number>(getGachaDrawCount());
  const [tickets, setTickets] = useState<number>(getEpicTickets());
  const [gachaResultIsDuplicate, setGachaResultIsDuplicate] = useState<boolean>(false);
  const [ticketEarnedAlert, setTicketEarnedAlert] = useState<boolean>(false);

  // Pokeball Shop & Equip States
  const [ballInventory, setBallInventory] = useState<BallInventory>(getBallInventory());
  const [equippedBall, setEquippedBall] = useState<'pokeball' | 'greatball' | 'ultraball'>(getEquippedBall());

  const handleBuyBall = (ballType: 'greatball' | 'ultraball', cost: number) => {
    const success = buyBall(ballType, cost);
    if (success) {
      sound.playSelect();
      setGold(getPlayerGold());
      setBallInventory(getBallInventory());
    } else {
      alert('골드가 부족합니다! 배틀에서 승리하여 골드를 획득하세요.');
    }
  };

  const handleBuyCandy = (cost: number) => {
    if (!selectedPokemon) {
      alert('사탕을 먹일 포켓몬을 먼저 선택해 주세요!');
      return;
    }
    const success = buyRareCandy(selectedPokemon.id, cost);
    if (success) {
      // 8-bit level up sound
      sound.playTone(523.25, 'square', 0.12, 0, 0.06);
      sound.playTone(659.25, 'square', 0.12, 0.08, 0.06);
      sound.playTone(783.99, 'square', 0.12, 0.16, 0.06);
      sound.playTone(1046.50, 'sine', 0.35, 0.24, 0.1);

      setGold(getPlayerGold());
      const updatedState = getPlayerPokemonState(selectedPokemon.id);
      alert(`🎉 ${selectedPokemon.koreanName}의 레벨이 Lv.${updatedState.level}로 올랐습니다!`);
    } else {
      alert('골드가 부족합니다! 배틀에서 승리하여 골드를 획득하세요.');
    }
  };

  const handleEquipBall = (ball: 'pokeball' | 'greatball' | 'ultraball') => {
    sound.playSelect();
    if (ball !== 'pokeball' && ballInventory[ball] <= 0) {
      alert('해당 포켓몬볼의 보유 개수가 부족합니다. 상점에서 먼저 구매해 주세요!');
      return;
    }
    saveEquippedBall(ball);
    setEquippedBall(ball);
  };

  // Compute probability table information dynamically based on currently locked Pokemons
  const ratesInfo = useMemo(() => {
    const allIds = Array.from({ length: MAX_POKEMON_COUNT }, (_, i) => i + 1);
    const lockedIds = allIds.filter(id => !unlockedIds.includes(id));
    
    const counts = { normal: 0, rare: 0, epic: 0, legendary: 0 };
    lockedIds.forEach(id => {
      const rarity = getPokemonRarity(id);
      counts[rarity]++;
    });

    const weights = { normal: 50, rare: 30, epic: 15, legendary: 5 };
    const totalWeight = lockedIds.reduce((sum, id) => sum + weights[getPokemonRarity(id)], 0);

    return {
      totalWeight,
      counts,
      lockedCount: lockedIds.length,
    };
  }, [unlockedIds]);

  // Load default Pokemon (Pikachu ID 25) or fallback to first unlocked starter
  useEffect(() => {
    const defaultId = unlockedIds.includes(25) ? 25 : unlockedIds[0] || 1;
    handleSelect(defaultId);
  }, []);

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSelect = async (id: number) => {
    if (battleStarting || loadingDetails) return;
    setLoadingDetails(true);
    setDetailError(null);
    sound.playSelect();

    try {
      const details = await fetchSinglePokemon(id);
      setSelectedPokemon(details);
    } catch (e) {
      console.error(e);
      setDetailError('상세 데이터를 가져오지 못했습니다.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter the full 251 list locally (Supports Gen 1 + Gen 2)
  const filteredList = useMemo(() => {
    return Object.entries(pokemonKoreanNames)
      .map(([idStr, name]) => ({
        id: parseInt(idStr),
        koreanName: name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idStr}.png`
      }))
      .filter(item => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
          item.koreanName.includes(query) ||
          String(item.id).includes(query)
        );
      });
  }, [searchTerm]);

  const handleStartBattle = async () => {
    if (!selectedPokemon || battleStarting) return;
    
    setBattleStarting(true);
    sound.playSelect();

    try {
      // Pick a random opponent from the entire 251 range!
      let enemyId = Math.floor(Math.random() * MAX_POKEMON_COUNT) + 1;
      while (enemyId === selectedPokemon.id) {
        enemyId = Math.floor(Math.random() * MAX_POKEMON_COUNT) + 1;
      }

      const enemy = await fetchSinglePokemon(enemyId);
      
      initBattle(selectedPokemon, enemy);
      
      setTimeout(() => {
        navigate('/battle');
      }, 500);
    } catch (e) {
      console.error('Failed to trigger battle starting', e);
      setBattleStarting(false);
    }
  };

  // Summons (Gacha) execution
  const handleDrawGacha = async (useTicket: boolean = false) => {
    if (isDrawing) return;
    if (useTicket) {
      if (tickets < 1) return;
    } else {
      if (gold < 10) return;
    }
    
    setIsDrawing(true);
    sound.playTone(400, 'sine', 0.15, 0, 0.05);
    
    // Smooth gacha machine shake feel
    setTimeout(async () => {
      const result = drawRandomPokemon(useTicket);
      
      if (result === -1) {
        alert('에픽+ 뽑기 티켓이 부족합니다!');
        setIsDrawing(false);
        return;
      }
      
      if (result === -2) {
        alert('골드가 부족합니다! 배틀에서 승리하여 골드를 모으세요.');
        setIsDrawing(false);
        return;
      }

      try {
        // Fetch detailed data for the newly drawn Pokemon
        const newPokemon = await fetchSinglePokemon(result.id);
        
        // Refresh states
        setUnlockedIds(getUnlockedPokemonIds());
        setGold(getPlayerGold());
        setDrawCount(getGachaDrawCount());
        setTickets(getEpicTickets());
        
        setGachaResultIsDuplicate(result.isDuplicate);
        setTicketEarnedAlert(result.ticketEarned);
        setGachaResult(newPokemon);
        
        // Play victory tone!
        sound.playSuperEffective();
        sound.playVictory();
      } catch (err) {
        console.error('Failed to fetch drawn Pokemon', err);
      } finally {
        setIsDrawing(false);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 max-w-6xl w-full mx-auto justify-center select-none font-outfit">
      
      {/* Top Header Row */}
      <header className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <img src="https://pokeapi.co/static/favicon-971c26027a08b50f7576579899321c17.ico" className="w-8 h-8 pixelated animate-pulse" alt="logo" />
          <h1 className="text-lg md:text-xl font-bold font-pixel tracking-wider text-slate-100 uppercase">
            POKÉMON <span className="text-poke-yellow">GBA</span> BATTLE
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Gold balance indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-slate-850 rounded shadow-pixel select-none">
            <span className="text-[12px] animate-pulse">🪙</span>
            <span className="font-pixel text-[10px] font-bold text-amber-400 tracking-wider">
              {gold} <span className="text-[7.5px] text-slate-500 font-bold uppercase">GOLD</span>
            </span>
          </div>

          {/* Ticket balance indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-slate-850 rounded shadow-pixel select-none">
            <span className="text-[12px]">🎟️</span>
            <span className="font-pixel text-[10px] font-bold text-poke-yellow tracking-wider">
              {tickets} <span className="text-[7.5px] text-slate-500 font-bold uppercase">TICKET</span>
            </span>
          </div>

          {/* History Link */}
          <button
            onClick={() => {
              sound.playSelect();
              navigate('/history');
            }}
            className="p-2 bg-slate-900 border-2 border-slate-800 hover:border-poke-yellow text-slate-400 hover:text-poke-yellow rounded shadow-pixel transition"
            title="배틀 기록 보기"
          >
            <History size={14} />
          </button>

          {/* Volume toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-2 bg-slate-900 border-2 border-slate-800 hover:border-poke-yellow text-slate-400 hover:text-poke-yellow rounded shadow-pixel transition"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </header>

      {/* Split main dashboard layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* ==================== LEFT 7 COLS: SEARCHABLE POKEMON LIST ==================== */}
        <section className="lg:col-span-7 bg-poke-card border-4 border-slate-800 p-4 rounded-lg flex flex-col justify-between shadow-pixel">
          
          {/* Search bar wrapper */}
          <div className="mb-4">
            <h2 className="text-xs font-pixel text-slate-200 mb-3 tracking-wide flex justify-between items-center">
              <span>도감 리스트 (Gen 1-2: 251마리)</span>
              <span className="text-[10px] text-poke-yellow font-black border border-poke-yellow/20 bg-poke-yellow/5 px-2 py-0.5 rounded shadow-[0_0_5px_rgba(255,204,1,0.1)]">보유: {unlockedIds.length} / 251</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="포켓몬 이름 또는 도감 번호 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border-2 border-slate-800 hover:border-slate-700 focus:border-poke-yellow text-slate-100 rounded-md outline-none transition font-pixel text-[10px] tracking-wide placeholder:text-slate-600 focus:shadow-pixelGlow shadow-pixel"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            </div>
          </div>

          {/* Scrollable grid of matched Pokemons */}
          <div className="flex-1 overflow-y-auto max-h-[220px] h-[30vh] pr-1.5 grid grid-cols-2 gap-3 border border-slate-950/80 bg-slate-950/20 p-2.5 rounded-md">
            {filteredList.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <span className="text-3xl mb-3 block">🔍</span>
                <p className="font-pixel text-[8px] text-slate-600">검색 조건에 맞는 포켓몬이 없습니다.</p>
              </div>
            ) : (
              filteredList.map((item) => {
                const isUnlocked = unlockedIds.includes(item.id);
                const isActive = selectedPokemon?.id === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => isUnlocked && handleSelect(item.id)}
                    disabled={!isUnlocked}
                    className={`flex items-center gap-2 px-2 bg-poke-card border-2 rounded transition-all transform hover:-translate-y-0.5 select-none text-left relative overflow-hidden h-14 ${
                      isUnlocked
                        ? isActive
                          ? 'border-poke-yellow shadow-pixelYellow bg-poke-yellow/5 cursor-pointer'
                          : 'border-slate-850 hover:border-slate-700 shadow-pixel cursor-pointer'
                        : 'border-slate-950 opacity-40 filter grayscale pointer-events-none select-none'
                    }`}
                  >
                    <img
                      src={item.sprite}
                      alt={item.koreanName}
                      className="w-10 h-10 pixelated shrink-0 filter drop-shadow"
                      loading="lazy"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center text-left py-0.5 pr-1.5">
                      <div className="flex justify-between items-center gap-1 leading-none mb-1 text-[9px]">
                        <div className="flex items-center gap-1">
                          <span className="font-pixel text-slate-500 block shrink-0">
                            #{String(item.id).padStart(3, '0')}
                          </span>
                          {isUnlocked && (
                            <span className={`font-pixel px-1 text-[6.5px] rounded-[2px] border ${rarityBadges[getPokemonRarity(item.id)].style} leading-none h-3.5 flex items-center`}>
                              {rarityBadges[getPokemonRarity(item.id)].label}
                            </span>
                          )}
                        </div>
                        {isUnlocked ? (
                          <span className="font-pixel bg-slate-800/80 text-poke-yellow px-1 h-3.5 flex items-center rounded-[2px] font-bold text-[7.5px] shrink-0">
                            Lv.{getPlayerPokemonState(item.id).level}
                          </span>
                        ) : null}
                      </div>
                      <span className="font-pixel text-[10.5px] font-bold text-slate-100 tracking-tight block truncate leading-none mt-0.5">
                        {isUnlocked ? item.koreanName : '??'}
                      </span>
                    </div>

                    {/* Lock overlay icon */}
                    {!isUnlocked && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 bg-slate-950/40 p-1 rounded-full border border-slate-800">
                        <Lock size={8} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Reset shuffle link */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-950/60 font-pixel text-[7px] text-slate-500">
            <span>TOTAL MATCHED: {filteredList.length} / 251</span>
            <button
              onClick={() => { setSearchTerm(''); sound.playSelect(); }}
              className="text-poke-yellow hover:underline cursor-pointer"
            >
              검색 초기화
            </button>
          </div>
        </section>

        {/* ==================== RIGHT 5 COLS: DETAILS PREVIEW CARD ==================== */}
        <section className="lg:col-span-5 flex flex-col">
          
          {loadingDetails ? (
            <div className="flex-1 bg-poke-card border-4 border-slate-800 rounded-lg flex flex-col justify-center items-center py-20 shadow-pixel">
              <div className="pokeball-loader mb-6 animate-spin" />
              <p className="font-pixel text-[8px] text-slate-500 animate-pulse">능력치 스캔 중...</p>
            </div>
          ) : detailError || !selectedPokemon ? (
            <div className="flex-1 bg-poke-card border-4 border-slate-800 rounded-lg p-6 flex flex-col justify-center items-center text-center shadow-pixel">
              <span className="text-3xl mb-3">📡</span>
              <h3 className="font-pixel text-[9px] text-slate-400 mb-2">포켓몬 데이터 미선택</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                왼쪽 도감 리스트에서 보유 중인 포켓몬을 터치하여 상세 스캔을 진행하세요.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-poke-card border-4 border-poke-yellow rounded-lg p-3 flex flex-col justify-between shadow-pixelYellow shadow-pixelGlow ring-2 ring-poke-yellow/15 relative overflow-hidden h-[460px] max-h-[42vh] min-h-[340px]"
            >
              
              {/* Retro holographic badges + Level Indicator (Merged to avoid overlaps!) */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                <span className={`font-pixel text-[8px] px-2 h-5 flex items-center rounded border font-bold ${rarityBadges[getPokemonRarity(selectedPokemon.id)].style}`}>
                  {rarityBadges[getPokemonRarity(selectedPokemon.id)].label}
                </span>
                <span className="font-pixel text-[9px] bg-slate-950 text-poke-yellow border border-poke-yellow/30 px-2 h-5 flex items-center rounded font-black shadow-pixel">
                  Lv. {getPlayerPokemonState(selectedPokemon.id).level}
                </span>
                {selectedPokemon.types.map(t => (
                  <span key={t} className={`px-2 h-5 flex items-center rounded text-[8px] font-pixel border font-bold uppercase ${typeBgColors[t] || typeBgColors.normal}`}>
                    {getTypeNameKorean(t)}
                  </span>
                ))}
              </div>

              {/* ID info */}
              <div className="mb-2 flex justify-between items-start">
                <div>
                  <span className="font-pixel text-[8px] text-slate-500 block">
                    INDEX NO. #{String(selectedPokemon.id).padStart(3, '0')}
                  </span>
                  <h3 className="font-pixel text-[13px] font-black text-slate-100 tracking-tight mt-0.5 flex items-center gap-1.5">
                    {selectedPokemon.koreanName}
                    <Sparkles size={10} className="text-poke-yellow animate-pulse" />
                  </h3>
                  <span className="text-[10px] text-slate-400 capitalize italic block">{selectedPokemon.name}</span>
                </div>
              </div>

              {/* Dynamic sprite display */}
              <div className="w-full h-18 aspect-[2.4/1] bg-gradient-to-b from-slate-950 via-[#0a122c] to-slate-950 rounded border-2 border-slate-850 flex items-center justify-center relative overflow-hidden group mb-2">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                <img
                  src={selectedPokemon.sprites.front_default}
                  alt={selectedPokemon.koreanName}
                  className="w-16 h-16 pixelated z-10 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition duration-200"
                />
                {/* Grass shadows */}
                <div className="absolute bottom-1 w-16 h-3 bg-[#0b3c29]/50 rounded-full blur-[1px] transform -scale-y-50 pointer-events-none" />
              </div>

              {/* Experience Bar (RPG level element!) */}
              {(() => {
                const state = getPlayerPokemonState(selectedPokemon.id);
                const reqExp = getRequiredExpForNextLevel(state.level);
                const pct = Math.min(100, (state.exp / reqExp) * 100);
                return (
                  <div className="bg-slate-950/60 border border-slate-850 p-2 rounded mb-2">
                    <div className="flex justify-between items-center text-[8px] font-pixel text-indigo-300 mb-1 font-bold">
                      <span>EXP PROGRESS</span>
                      <span>{state.exp} / {reqExp} XP</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Stats Bar Grid (overlapping completely solved by gap and w-16 bounds!) */}
              <div className="space-y-1.5 border-t border-slate-950/60 pt-2 mb-2">
                
                {/* HP */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-rose-400 font-pixel text-[8px] flex items-center gap-1 shrink-0">
                    <Heart size={10} /> HP
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedPokemon.stats.hp / 160) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-semibold pl-1 shrink-0 text-[10px]">
                    {selectedPokemon.stats.hp}
                  </span>
                </div>

                {/* ATK */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-orange-400 font-pixel text-[8px] flex items-center gap-1 shrink-0">
                    <Swords size={10} /> ATK
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedPokemon.stats.attack / 160) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-semibold pl-1 shrink-0 text-[10px]">
                    {selectedPokemon.stats.attack}
                  </span>
                </div>

                {/* DEF */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-emerald-400 font-pixel text-[8px] flex items-center gap-1 shrink-0">
                    <Shield size={10} /> DEF
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedPokemon.stats.defense / 160) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-semibold pl-1 shrink-0 text-[10px]">
                    {selectedPokemon.stats.defense}
                  </span>
                </div>

                {/* SPD */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-sky-400 font-pixel text-[8px] flex items-center gap-1 shrink-0">
                    <Zap size={10} /> SPD
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(100, (selectedPokemon.stats.speed / 160) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-semibold pl-1 shrink-0 text-[10px]">
                    {selectedPokemon.stats.speed}
                  </span>
                </div>
              </div>

              {/* Moves List Overview */}
              <div className="bg-slate-950/60 rounded p-1.5 border border-slate-850 flex flex-col justify-between">
                <span className="font-pixel text-[7px] text-slate-500 block mb-1 uppercase">보유 배틀 기술 (RANDOMIZED MOVES)</span>
                <div className="flex flex-wrap gap-1">
                  {selectedPokemon.moves.map(move => (
                    <span key={move.name} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 font-pixel text-[7px] rounded capitalize">
                      {move.koreanName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equip Pokeball Selector */}
              <div className="bg-slate-950/60 rounded p-1.5 border border-slate-850 flex flex-col justify-between">
                <span className="font-pixel text-[7px] text-slate-500 block mb-1.5 uppercase">배틀 출전용 포켓몬볼 장착 (EQUIP POKEBALL)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleEquipBall('pokeball')}
                    className={`py-1 text-[8.5px] font-pixel border-2 rounded flex items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                      equippedBall === 'pokeball'
                        ? 'border-poke-yellow bg-poke-yellow/10 text-poke-yellow font-black'
                        : 'border-slate-850 bg-slate-900 text-slate-450 hover:border-slate-700'
                    }`}
                  >
                    <BallSVG type="pokeball" className="w-3.5 h-3.5" />
                    <span>몬스터볼 (무제한)</span>
                  </button>
                  <button
                    onClick={() => handleEquipBall('greatball')}
                    className={`py-1 text-[8.5px] font-pixel border-2 rounded flex items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                      equippedBall === 'greatball'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-black'
                        : 'border-slate-850 bg-slate-900 text-slate-450 hover:border-slate-700'
                    }`}
                  >
                    <BallSVG type="greatball" className="w-3.5 h-3.5" />
                    <span>슈퍼볼 ({ballInventory.greatball})</span>
                  </button>
                  <button
                    onClick={() => handleEquipBall('ultraball')}
                    className={`py-1 text-[8.5px] font-pixel border-2 rounded flex items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                      equippedBall === 'ultraball'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 font-black'
                        : 'border-slate-850 bg-slate-900 text-slate-450 hover:border-slate-700'
                    }`}
                  >
                    <BallSVG type="ultraball" className="w-3.5 h-3.5" />
                    <span>하이퍼볼 ({ballInventory.ultraball})</span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </section>

      </div>

      {/* ==================== MIDDLE AREA: GACHA & SHOP GRID ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* ==================== 1. GACHA MACHINE ==================== */}
        <div className="bg-poke-card border-4 border-slate-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden select-none shadow-pixel">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <div className="flex items-start gap-3.5 z-10 mb-4">
            <span className="text-3xl animate-bounce shrink-0" style={{ animationDuration: '3s' }}>🔮</span>
            <div>
              <h3 className="font-pixel text-[9px] font-black text-slate-100 tracking-wide uppercase flex items-center gap-1.5 leading-none">
                포켓몬 캡슐 뽑기 기계 <span className="text-indigo-400 font-bold text-[7px] border border-indigo-700/60 px-1 py-0.2 bg-indigo-950/50 rounded leading-none">SUMMON</span>
                <button
                  onClick={() => { sound.playSelect(); setShowRates(true); }}
                  className="px-1.5 py-0.5 border border-slate-700 bg-slate-900 text-slate-400 hover:text-poke-yellow hover:border-poke-yellow font-pixel text-[6.5px] rounded cursor-pointer transition ml-1 normal-case font-bold leading-none"
                >
                  확률표
                </button>
              </h3>
              <p className="font-pixel text-[7px] text-slate-500 leading-normal mt-1.5">
                🪙 10 골드를 소비하여 포켓몬을 무작위 소환하세요! 이미 보유한 포켓몬이 등장하면 레벨이 1 오릅니다. (30회 누적 뽑기마다 에픽+ 티켓 1장 지급)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 z-10 mt-auto">
            {/* Gold Summon */}
            <button
              onClick={() => handleDrawGacha(false)}
              disabled={isDrawing || gold < 10}
              className={`px-3 py-2.5 font-pixel text-[9.5px] font-black rounded border-2 transition shadow-pixel cursor-pointer flex flex-col items-center justify-center gap-1.5 transform active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 ${
                gold >= 10
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-650 text-slate-100 border-indigo-400 shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-750 shadow-pixelGlow'
                  : 'bg-slate-850 text-slate-500 border-slate-800'
              }`}
            >
              {isDrawing ? (
                <span className="animate-spin text-sm">🌀</span>
              ) : (
                <>
                  <span>🪙 10 GOLD로 뽑기</span>
                  <span className="text-[6.5px] text-indigo-300 font-bold">누적: {drawCount}/30 회</span>
                </>
              )}
            </button>

            {/* Ticket Summon */}
            <button
              onClick={() => handleDrawGacha(true)}
              disabled={isDrawing || tickets < 1}
              className={`px-3 py-2.5 font-pixel text-[9.5px] font-black rounded border-2 transition shadow-pixel cursor-pointer flex flex-col items-center justify-center gap-1.5 transform active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 ${
                tickets >= 1
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 shadow-pixelGlow animate-pulse'
                  : 'bg-slate-850 text-slate-500 border-slate-800'
              }`}
            >
              {isDrawing ? (
                <span className="animate-spin text-sm">🌀</span>
              ) : (
                <>
                  <span>🎟️ 에픽+ 티켓 뽑기</span>
                  <span className="text-[6.5px] text-slate-650 font-black uppercase">최소 에픽 보장!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ==================== 2. POKEBALL SHOP ==================== */}
        <div className="bg-poke-card border-4 border-slate-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden select-none shadow-pixel">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
          
          <div className="flex items-start gap-3.5 z-10 mb-4">
            <span className="text-3xl shrink-0 animate-pulse">🏪</span>
            <div>
              <h3 className="font-pixel text-[9px] font-black text-slate-100 tracking-wide uppercase flex items-center gap-1.5 leading-none">
                포켓몬 상점 <span className="text-emerald-400 font-bold text-[7px] border border-emerald-700/60 px-1 py-0.2 bg-emerald-950/50 rounded leading-none">POKÉ SHOP</span>
              </h3>
              <p className="font-pixel text-[7px] text-slate-500 leading-normal mt-1.5">
                배틀용 특수 포켓몬볼 또는 선택한 포켓몬을 즉시 레벨업시키는 이상한사탕을 구매할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Shop Item List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-10 mt-auto">
            {/* Great Ball */}
            <div className="bg-slate-950/40 border border-slate-855 rounded p-2 flex flex-col items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <BallSVG type="greatball" className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-pixel text-[9.5px] font-black text-slate-150">슈퍼볼</div>
                  <div className="font-pixel text-[6.5px] text-blue-400 font-bold">EXP +20% 보너스</div>
                </div>
              </div>
              <div className="flex justify-between items-center w-full mt-1 pt-1.5 border-t border-slate-900/40">
                <span className="font-pixel text-[7.5px] text-slate-500">보유: {ballInventory.greatball}개</span>
                <button
                  onClick={() => handleBuyBall('greatball', 15)}
                  disabled={gold < 15}
                  className={`px-2 py-1.5 font-pixel text-[8px] font-black rounded border cursor-pointer transition transform active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                    gold >= 15
                      ? 'bg-blue-600 hover:bg-blue-750 text-slate-100 border-blue-400 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] shadow-pixel'
                      : 'bg-slate-850 text-slate-500 border-slate-800'
                  }`}
                >
                  🪙 15G 구매
                </button>
              </div>
            </div>

            {/* Ultra Ball */}
            <div className="bg-slate-950/40 border border-slate-855 rounded p-2 flex flex-col items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <BallSVG type="ultraball" className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-pixel text-[9.5px] font-black text-slate-150">하이퍼볼</div>
                  <div className="font-pixel text-[6.5px] text-yellow-400 font-bold">EXP +50% 보너스</div>
                </div>
              </div>
              <div className="flex justify-between items-center w-full mt-1 pt-1.5 border-t border-slate-900/40">
                <span className="font-pixel text-[7.5px] text-slate-500">보유: {ballInventory.ultraball}개</span>
                <button
                  onClick={() => handleBuyBall('ultraball', 30)}
                  disabled={gold < 30}
                  className={`px-2 py-1.5 font-pixel text-[8px] font-black rounded border cursor-pointer transition transform active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                    gold >= 30
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-black hover:shadow-[0_0_8px_rgba(245,158,11,0.3)] shadow-pixel'
                      : 'bg-slate-850 text-slate-500 border-slate-800'
                  }`}
                >
                  🪙 30G 구매
                </button>
              </div>
            </div>

            {/* Rare Candy */}
            <div className="bg-slate-950/40 border border-slate-855 rounded p-2 flex flex-col items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>🍬</span>
                <div className="text-left">
                  <div className="font-pixel text-[9.5px] font-black text-slate-150">이상한사탕</div>
                  <div className="font-pixel text-[6.5px] text-purple-400 font-bold">레벨 +1 즉시 상승</div>
                </div>
              </div>
              <div className="flex justify-between items-center w-full mt-1 pt-1.5 border-t border-slate-900/40">
                <span className="font-pixel text-[7.5px] text-slate-500 tracking-tight truncate max-w-[50px]" title={selectedPokemon ? selectedPokemon.koreanName : '선택 없음'}>
                  {selectedPokemon ? selectedPokemon.koreanName : '선택 없음'}
                </span>
                <button
                  onClick={() => handleBuyCandy(50)}
                  disabled={gold < 50 || !selectedPokemon}
                  className={`px-2 py-1.5 font-pixel text-[8px] font-black rounded border cursor-pointer transition transform active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                    gold >= 50 && selectedPokemon
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-slate-100 border-purple-400 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] shadow-pixel'
                      : 'bg-slate-850 text-slate-500 border-slate-800'
                  }`}
                >
                  🪙 50G 구매
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Play Actions bar */}
      <footer className="flex justify-center border-t-2 border-slate-800 pt-5">
        <button
          onClick={handleStartBattle}
          disabled={!selectedPokemon || battleStarting}
          className={`w-full sm:w-auto px-12 py-4 font-pixel text-[10px] font-black rounded transition shadow-pixel cursor-pointer flex items-center justify-center gap-2 transform active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 select-none ${
            selectedPokemon
              ? 'bg-poke-yellow text-slate-950 hover:bg-yellow-400 border-2 border-yellow-300 shadow-pixelYellow shadow-pixelGlow animate-pulse'
              : 'bg-slate-850 text-slate-500 border-2 border-slate-800'
          }`}
        >
          <Swords size={12} />
          {battleStarting ? '배틀 생성 중...' : '배틀 시작! (BATTLE START)'}
        </button>
      </footer>

      {/* ==================== SUMMON SUCCESS OVERLAY MODAL ==================== */}
      <AnimatePresence>
        {gachaResult && (() => {
          const rarity = getPokemonRarity(gachaResult.id);
          const style = gachaRarityStyles[rarity];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 flex items-center justify-center backdrop-blur-md p-4 z-50 bg-slate-950/75 select-none"
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                className={`max-w-sm w-full bg-[#0c101f] border-4 ${style.modalBorder} rounded-lg p-6 ${style.modalShadow} text-center flex flex-col items-center relative overflow-hidden crt-effect`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02] pointer-events-none" />
                
                {/* Dynamic neon light rays */}
                <div className={`absolute top-12 w-48 h-48 ${style.glowBg} rounded-full blur-[40px] pointer-events-none`} />

                <span className="text-4xl mb-2 animate-bounce">✨</span>
                <h2 className="text-[12px] font-pixel text-poke-yellow tracking-widest animate-pulse font-black uppercase mb-1">
                  {gachaResultIsDuplicate ? 'POKÉMON LEVEL UP!' : 'NEW POKÉMON SUMMONED!'}
                </h2>
                <p className={`text-[8px] font-pixel ${style.subText} font-bold mb-4 uppercase tracking-wide border-b ${style.subBorder} pb-1 w-full`}>
                  {gachaResultIsDuplicate ? '이미 보유 중인 포켓몬이 등장하여 레벨이 1 올랐습니다!' : '신규 포켓몬이 도감에 잠금 해제되었습니다!'}
                </p>

                {ticketEarnedAlert && (
                  <div className="mb-4 px-2 py-1.5 bg-amber-500/20 border border-amber-500 text-amber-200 rounded font-pixel text-[7.5px] animate-pulse w-full">
                    🎉 30회 누적 뽑기 달성! 에픽+ 확정 티켓 1장 획득!
                  </div>
                )}

                {/* Holographic Portal Box */}
                <div className={`w-full aspect-video bg-gradient-to-b ${style.portalBg} rounded border-2 ${style.portalBorder} flex items-center justify-center relative overflow-hidden mb-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]`}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                  <img
                    src={gachaResult.sprites.front_default}
                    alt={gachaResult.koreanName}
                    className={`w-24 h-24 pixelated z-10 filter ${style.spriteGlow} transform scale-110`}
                  />
                  {/* Neon shadow */}
                  <div className={`absolute bottom-2 w-20 h-4 ${style.shadowBg} rounded-full blur-[2px] transform -scale-y-50 pointer-events-none`} />
                </div>

                {/* Specs & ID Info */}
                <div className="mb-6 w-full text-center">
                  <span className="font-pixel text-[8px] text-slate-500 block">
                    INDEX NO. #{String(gachaResult.id).padStart(3, '0')}
                  </span>
                  <h3 className="font-pixel text-[13px] font-black text-slate-100 mt-1 flex items-center justify-center gap-1">
                    {gachaResult.koreanName}
                  </h3>
                  
                  {/* Rarity & Type Badges */}
                  <div className="flex justify-center items-center gap-1.5 mt-2">
                    <span className="font-pixel text-[7.5px] bg-slate-950 text-poke-yellow border border-poke-yellow/30 px-2 py-0.5 rounded font-black shadow-pixel">
                      Lv. {getPlayerPokemonState(gachaResult.id).level}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[7.5px] font-pixel border font-bold ${rarityBadges[rarity].style}`}>
                      {rarityBadges[rarity].label}
                    </span>
                    {gachaResult.types.map(t => (
                      <span key={t} className={`px-2 py-0.5 rounded text-[7.5px] font-pixel border font-bold uppercase ${typeBgColors[t] || typeBgColors.normal}`}>
                        {getTypeNameKorean(t)}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playSelect();
                    setGachaResult(null);
                  }}
                  className={`w-full py-3 ${style.btnStyle} font-pixel text-[9px] font-black rounded border-2 transition shadow-pixel cursor-pointer flex items-center justify-center gap-1 transform active:translate-y-0.5`}
                >
                  도감 닫기 (CLOSE)
                </button>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ==================== PROBABILITY RATES OVERLAY MODAL ==================== */}
      <AnimatePresence>
        {showRates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center backdrop-blur-md p-4 z-50 bg-slate-950/75 select-none"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="max-w-md w-full bg-[#0c101f] border-4 border-slate-700 rounded-lg p-5 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-left flex flex-col relative overflow-hidden crt-effect"
            >
              <h2 className="text-[11px] font-pixel text-poke-yellow tracking-widest font-black uppercase mb-1 flex items-center gap-1.5">
                <span>🔮 CAPSULE SUMMON PROBABILITIES</span>
              </h2>
              <p className="text-[7.5px] font-pixel text-slate-400 font-bold mb-4 uppercase tracking-wide border-b border-slate-800 pb-1 w-full">
                현재 캡슐 뽑기 획득 확률 정보 (중복 없음)
              </p>

              <div className="space-y-3 font-pixel text-[8px] text-slate-300 mb-6 bg-slate-950/40 p-3 rounded border border-slate-900">
                {ratesInfo.totalWeight === 0 ? (
                  <div className="text-center py-4 text-poke-yellow">
                    모든 포켓몬을 획득하셨습니다!
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5 mb-1.5">
                      <span>등급 (가중치)</span>
                      <span>남은 수량</span>
                      <span>총 출현 확률</span>
                      <span>개별 확률</span>
                    </div>
                    {/* Normal */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        일반 (50)
                      </span>
                      <span className="text-slate-300">{ratesInfo.counts.normal}마리</span>
                      <span className="text-slate-100 font-bold">
                        {ratesInfo.counts.normal > 0 ? `${((ratesInfo.counts.normal * 50) / ratesInfo.totalWeight * 100).toFixed(1)}%` : '0%'}
                      </span>
                      <span className="text-slate-400">
                        {ratesInfo.counts.normal > 0 ? `${((50 / ratesInfo.totalWeight) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    {/* Rare */}
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        레어 (30)
                      </span>
                      <span className="text-slate-300">{ratesInfo.counts.rare}마리</span>
                      <span className="text-blue-100 font-bold">
                        {ratesInfo.counts.rare > 0 ? `${((ratesInfo.counts.rare * 30) / ratesInfo.totalWeight * 100).toFixed(1)}%` : '0%'}
                      </span>
                      <span className="text-blue-400">
                        {ratesInfo.counts.rare > 0 ? `${((30 / ratesInfo.totalWeight) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    {/* Epic */}
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        에픽 (15)
                      </span>
                      <span className="text-slate-300">{ratesInfo.counts.epic}마리</span>
                      <span className="text-purple-100 font-bold">
                        {ratesInfo.counts.epic > 0 ? `${((ratesInfo.counts.epic * 15) / ratesInfo.totalWeight * 100).toFixed(1)}%` : '0%'}
                      </span>
                      <span className="text-purple-400">
                        {ratesInfo.counts.epic > 0 ? `${((15 / ratesInfo.totalWeight) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    {/* Legendary */}
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        전설 (5)
                      </span>
                      <span className="text-slate-300">{ratesInfo.counts.legendary}마리</span>
                      <span className="text-amber-200 font-bold">
                        {ratesInfo.counts.legendary > 0 ? `${((ratesInfo.counts.legendary * 5) / ratesInfo.totalWeight * 100).toFixed(1)}%` : '0%'}
                      </span>
                      <span className="text-amber-400">
                        {ratesInfo.counts.legendary > 0 ? `${((5 / ratesInfo.totalWeight) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>

                    <div className="border-t border-slate-900 pt-2.5 mt-2.5 text-[7px] text-slate-500 leading-normal">
                      * 캡슐 뽑기 시 미획득한 포켓몬 중에서 가중치를 기준으로 랜덤하게 결정됩니다. 획득 시마다 남은 수량과 확률이 실시간으로 변동됩니다.
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  sound.playSelect();
                  setShowRates(false);
                }}
                className="w-full py-2.5 bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 text-slate-100 font-pixel text-[8px] font-black rounded transition shadow-pixel cursor-pointer flex items-center justify-center animate-pulse"
              >
                닫기 (CLOSE)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
