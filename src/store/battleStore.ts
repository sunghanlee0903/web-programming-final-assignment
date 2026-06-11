import { create } from 'zustand';
import type { Pokemon, Move, BattleRecord } from '../types/pokemon';
import { getTypeEffectiveness } from '../utils/typeChart';
import { sound } from '../utils/sound';
import { 
  getPlayerPokemonState, 
  addExperience, 
  getPlayerGold, 
  addPlayerGold,
  getEquippedBall,
  consumeEquippedBall,
  getBallInventory
} from '../utils/levelStorage';

interface BattleStore {
  playerPokemon: Pokemon | null;
  enemyPokemon: Pokemon | null;
  playerLevel: number;
  enemyLevel: number;
  playerHP: number;
  enemyHP: number;
  playerMaxHP: number;
  enemyMaxHP: number;
  turn: 'player' | 'enemy' | 'idle';
  phase: 'select' | 'battle' | 'result';
  battleLog: string[];
  isAnimating: boolean;
  activeAnimation: {
    type: 'player-attack' | 'enemy-attack' | 'player-damage' | 'enemy-damage' | null;
    moveName?: string;
  };
  winner: 'player' | 'enemy' | null;
  usedBall: 'pokeball' | 'greatball' | 'ultraball';
  // EXP / Level-up result states
  earnedExp: number;
  expBefore: number;
  expAfter: number;
  leveledUp: boolean;
  // Gold currency states
  gold: number;
  earnedGold: number;

  initBattle: (player: Pokemon, enemy: Pokemon) => void;
  playerAttack: (move: Move) => Promise<void>;
  enemyAttack: () => Promise<void>;
  addLog: (message: string) => void;
  checkBattleEnd: () => boolean;
  resetBattle: () => void;
}

// GBA style HP scaling with dynamic level
const calculateMaxHp = (baseHp: number, level: number) => {
  return Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
};

// Attack & Defense scaling with dynamic level
const scaleStat = (baseStat: number, level: number) => {
  return Math.floor(((2 * baseStat + 31) * level) / 100) + 5;
};

const getBallNameKorean = (ball: 'pokeball' | 'greatball' | 'ultraball'): string => {
  if (ball === 'greatball') return '슈퍼볼';
  if (ball === 'ultraball') return '하이퍼볼';
  return '몬스터볼';
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  playerPokemon: null,
  enemyPokemon: null,
  playerLevel: 1,
  enemyLevel: 1,
  playerHP: 0,
  enemyHP: 0,
  playerMaxHP: 0,
  enemyMaxHP: 0,
  turn: 'idle',
  phase: 'select',
  battleLog: [],
  isAnimating: false,
  activeAnimation: { type: null },
  winner: null,
  usedBall: 'pokeball',
  earnedExp: 0,
  expBefore: 0,
  expAfter: 0,
  leveledUp: false,
  gold: 0,
  earnedGold: 0,

  initBattle: (player, enemy) => {
    // 1. Get stored level for the chosen player Pokemon
    const playerState = getPlayerPokemonState(player.id);
    const pLevel = playerState.level;

    // 2. Scale enemy level dynamically around player level (Challenge Match!)
    const eLevel = Math.max(1, pLevel + Math.floor(Math.random() * 3) - 1);

    const pMaxHP = calculateMaxHp(player.stats.hp, pLevel);
    const eMaxHP = calculateMaxHp(enemy.stats.hp, eLevel);
    
    // 3. Load latest player gold
    const currentGold = getPlayerGold();

    // 4. Retrieve equipped ball and check inventory
    const equippedBall = getEquippedBall();
    const inv = getBallInventory();
    const usedBall = (equippedBall !== 'pokeball' && inv[equippedBall] <= 0) ? 'pokeball' : equippedBall;

    // Consume the ball
    consumeEquippedBall();
    
    set({
      playerPokemon: player,
      enemyPokemon: enemy,
      playerLevel: pLevel,
      enemyLevel: eLevel,
      playerHP: pMaxHP,
      enemyHP: eMaxHP,
      playerMaxHP: pMaxHP,
      enemyMaxHP: eMaxHP,
      turn: player.stats.speed >= enemy.stats.speed ? 'player' : 'enemy',
      phase: 'battle',
      battleLog: [
        `야생의 Lv.${eLevel} ${enemy.koreanName}(이)가 나타났다!`, 
        `${getBallNameKorean(usedBall)}에서 Lv.${pLevel} ${player.koreanName}(이)가 나왔다!`
      ],
      isAnimating: false,
      activeAnimation: { type: null },
      winner: null,
      usedBall,
      earnedExp: 0,
      expBefore: 0,
      expAfter: 0,
      leveledUp: false,
      gold: currentGold,
      earnedGold: 0,
    });

    sound.playSelect();
  },

  addLog: (message) => {
    set((state) => ({
      battleLog: [...state.battleLog, message],
    }));
  },

  playerAttack: async (move) => {
    const { playerPokemon, enemyPokemon, enemyHP, isAnimating, turn, playerLevel, enemyLevel } = get();
    if (!playerPokemon || !enemyPokemon || isAnimating || turn !== 'player' || enemyHP <= 0) return;

    set({ isAnimating: true, turn: 'idle' });

    // 1. Attack Dash Animation
    set({ activeAnimation: { type: 'player-attack', moveName: move.koreanName } });
    get().addLog(`${playerPokemon.koreanName}의 ${move.koreanName}!`);
    sound.playSelect();

    await new Promise((resolve) => setTimeout(resolve, 600));

    // 2. Hit Accuracy Check
    const isHit = Math.random() * 100 <= move.accuracy;
    if (!isHit) {
      get().addLog(`${playerPokemon.koreanName}의 공격은 빗나갔다!`);
      set({ activeAnimation: { type: null }, isAnimating: false });
      
      // Pass turn to enemy
      setTimeout(() => {
        set({ turn: 'enemy' });
      }, 800);
      return;
    }

    // 3. Crit Check (6.25% GBA critical hit chance)
    const isCrit = Math.random() < 0.0625;

    // 4. Calculate stats with dynamic levels
    const pAtk = scaleStat(playerPokemon.stats.attack, playerLevel);
    const eDef = scaleStat(enemyPokemon.stats.defense, enemyLevel);

    // 5. Type Effectiveness Check
    const { multiplier: typeMult, message: typeMsg } = getTypeEffectiveness(move.type, enemyPokemon.types);

    // Play corresponding impact sound
    if (typeMult > 1.0) {
      sound.playSuperEffective();
    } else {
      sound.playHit();
    }

    // 6. GBA Damage Formula with dynamic playerLevel
    const critMult = isCrit ? 1.5 : 1.0;
    const randomOffset = Math.random() * (1.0 - 0.85) + 0.85;
    const baseDamage = Math.floor(
      ((2 * playerLevel / 5 + 2) * move.power * (pAtk / eDef)) / 50 + 2
    );
    const totalDamage = Math.max(1, Math.floor(baseDamage * critMult * typeMult * randomOffset));

    // 7. Enemy Damage Shake Animation
    set({ activeAnimation: { type: 'enemy-damage' } });
    
    // Reduce health
    const newEnemyHP = Math.max(0, enemyHP - totalDamage);
    set({ enemyHP: newEnemyHP });

    if (isCrit) {
      get().addLog('급소에 맞았다!');
    }
    if (typeMsg) {
      get().addLog(typeMsg);
    }
    get().addLog(`${enemyPokemon.koreanName}에게 ${totalDamage}의 피해!`);

    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ activeAnimation: { type: null } });

    // Check if battle ends
    const gameEnded = get().checkBattleEnd();
    if (!gameEnded) {
      set({ isAnimating: false, turn: 'enemy' });
    }
  },

  enemyAttack: async () => {
    const { playerPokemon, enemyPokemon, playerHP, isAnimating, turn, playerLevel, enemyLevel } = get();
    if (!playerPokemon || !enemyPokemon || isAnimating || turn !== 'enemy' || playerHP <= 0) return;

    set({ isAnimating: true, turn: 'idle' });

    // Select random move
    const randomMove = enemyPokemon.moves[Math.floor(Math.random() * enemyPokemon.moves.length)];

    // 1. Attack Dash Animation
    set({ activeAnimation: { type: 'enemy-attack', moveName: randomMove.koreanName } });
    get().addLog(`상대 ${enemyPokemon.koreanName}의 ${randomMove.koreanName}!`);

    await new Promise((resolve) => setTimeout(resolve, 600));

    // 2. Hit Accuracy Check
    const isHit = Math.random() * 100 <= randomMove.accuracy;
    if (!isHit) {
      get().addLog(`상대 ${enemyPokemon.koreanName}의 공격은 빗나갔다!`);
      set({ activeAnimation: { type: null }, isAnimating: false });
      
      // Pass turn to player
      setTimeout(() => {
        set({ turn: 'player' });
      }, 800);
      return;
    }

    // 3. Crit Check (6.25% GBA crit chance)
    const isCrit = Math.random() < 0.0625;

    // 4. Calculate stats with dynamic levels
    const eAtk = scaleStat(enemyPokemon.stats.attack, enemyLevel);
    const pDef = scaleStat(playerPokemon.stats.defense, playerLevel);

    // 5. Type Effectiveness Check
    const { multiplier: typeMult, message: typeMsg } = getTypeEffectiveness(randomMove.type, playerPokemon.types);

    // Play corresponding sound
    if (typeMult > 1.0) {
      sound.playSuperEffective();
    } else {
      sound.playHit();
    }

    // 6. GBA Damage Formula with dynamic enemyLevel
    const critMult = isCrit ? 1.5 : 1.0;
    const randomOffset = Math.random() * (1.0 - 0.85) + 0.85;
    const baseDamage = Math.floor(
      ((2 * enemyLevel / 5 + 2) * randomMove.power * (eAtk / pDef)) / 50 + 2
    );
    const totalDamage = Math.max(1, Math.floor(baseDamage * critMult * typeMult * randomOffset));

    // 7. Player Damage Shake Animation
    set({ activeAnimation: { type: 'player-damage' } });

    // Reduce health
    const newPlayerHP = Math.max(0, playerHP - totalDamage);
    set({ playerHP: newPlayerHP });

    if (isCrit) {
      get().addLog('급소에 맞았다!');
    }
    if (typeMsg) {
      get().addLog(typeMsg);
    }
    get().addLog(`${playerPokemon.koreanName}은(는) ${totalDamage}의 피해를 입었다!`);

    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ activeAnimation: { type: null } });

    // Check if battle ends
    const gameEnded = get().checkBattleEnd();
    if (!gameEnded) {
      set({ isAnimating: false, turn: 'player' });
    }
  },

  checkBattleEnd: () => {
    const { playerPokemon, enemyPokemon, playerHP, enemyHP, battleLog, usedBall } = get();
    if (!playerPokemon || !enemyPokemon) return false;

    if (enemyHP <= 0) {
      // 1. Player Victory EXP: Gain 80 ~ 120 EXP
      const baseExp = Math.floor(Math.random() * 41) + 80;
      const multiplier = usedBall === 'greatball' ? 1.2 : usedBall === 'ultraball' ? 1.5 : 1.0;
      const earnedXp = Math.floor(baseExp * multiplier);
      const expResult = addExperience(playerPokemon.id, earnedXp);

      // 2. Player Victory Gold: Earn 2 GOLD
      const finalGold = addPlayerGold(2);

      set({
        phase: 'result',
        winner: 'player',
        isAnimating: false,
        earnedExp: expResult.earnedExp,
        expBefore: expResult.before.exp,
        expAfter: expResult.after.exp,
        playerLevel: expResult.after.level,
        leveledUp: expResult.leveledUp,
        gold: finalGold,
        earnedGold: 2,
      });

      get().addLog(`${enemyPokemon.koreanName}은(는) 쓰러졌다!`);
      get().addLog(`${playerPokemon.koreanName}의 승리!`);
      get().addLog(`${earnedXp} EXP를 획득했다! ${multiplier > 1.0 ? `(${multiplier === 1.2 ? '슈퍼볼' : '하이퍼볼'} 보너스 +${Math.round((multiplier - 1) * 100)}%)` : ''}`);
      get().addLog('2 골드를 획득했다!');
      if (expResult.leveledUp) {
        get().addLog(`${playerPokemon.koreanName}은(는) Lv.${expResult.after.level}(으)로 레벨업했다!`);
      }
      
      // Save history record
      try {
        const history: BattleRecord[] = JSON.parse(localStorage.getItem('pokemon_battle_history') || '[]');
        const newRecord: BattleRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          playerPokemonName: playerPokemon.koreanName,
          enemyPokemonName: enemyPokemon.koreanName,
          playerPokemonSprite: playerPokemon.sprites.front_default,
          enemyPokemonSprite: enemyPokemon.sprites.front_default,
          result: 'WIN',
          turnsCount: Math.floor(battleLog.length / 2)
        };
        localStorage.setItem('pokemon_battle_history', JSON.stringify([newRecord, ...history].slice(0, 10)));
      } catch (e) {
        console.warn('Could not save battle history', e);
      }

      // Play victory theme
      sound.playVictory();
      return true;
    }

    if (playerHP <= 0) {
      // 1. Player Defeat EXP: Gain 20 ~ 40 EXP
      const baseExp = Math.floor(Math.random() * 21) + 20;
      const multiplier = usedBall === 'greatball' ? 1.2 : usedBall === 'ultraball' ? 1.5 : 1.0;
      const earnedXp = Math.floor(baseExp * multiplier);
      const expResult = addExperience(playerPokemon.id, earnedXp);

      // 2. Player Defeat Gold: Earn 1 GOLD
      const finalGold = addPlayerGold(1);

      set({
        phase: 'result',
        winner: 'enemy',
        isAnimating: false,
        earnedExp: expResult.earnedExp,
        expBefore: expResult.before.exp,
        expAfter: expResult.after.exp,
        playerLevel: expResult.after.level,
        leveledUp: expResult.leveledUp,
        gold: finalGold,
        earnedGold: 1,
      });

      get().addLog(`${playerPokemon.koreanName}은(는) 쓰러졌다...`);
      get().addLog('플레이어는 눈앞이 캄캄해졌다!');
      get().addLog(`${earnedXp} EXP를 획득했다. ${multiplier > 1.0 ? `(${multiplier === 1.2 ? '슈퍼볼' : '하이퍼볼'} 보너스 +${Math.round((multiplier - 1) * 100)}%)` : ''}`);
      get().addLog('1 골드를 획득했다.');
      if (expResult.leveledUp) {
        get().addLog(`${playerPokemon.koreanName}은(는) Lv.${expResult.after.level}(으)로 레벨업했다!`);
      }

      // Save history record
      try {
        const history: BattleRecord[] = JSON.parse(localStorage.getItem('pokemon_battle_history') || '[]');
        const newRecord: BattleRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          playerPokemonName: playerPokemon.koreanName,
          enemyPokemonName: enemyPokemon.koreanName,
          playerPokemonSprite: playerPokemon.sprites.front_default,
          enemyPokemonSprite: enemyPokemon.sprites.front_default,
          result: 'LOSE',
          turnsCount: Math.floor(battleLog.length / 2)
        };
        localStorage.setItem('pokemon_battle_history', JSON.stringify([newRecord, ...history].slice(0, 10)));
      } catch (e) {
        console.warn('Could not save battle history', e);
      }

      // Play defeat theme
      sound.playDefeat();
      return true;
    }

    return false;
  },

  resetBattle: () => {
    set({
      playerPokemon: null,
      enemyPokemon: null,
      playerHP: 0,
      enemyHP: 0,
      playerMaxHP: 0,
      enemyMaxHP: 0,
      turn: 'idle',
      phase: 'select',
      battleLog: [],
      isAnimating: false,
      activeAnimation: { type: null },
      winner: null,
      earnedExp: 0,
      expBefore: 0,
      expAfter: 0,
      leveledUp: false,
      gold: getPlayerGold(),
      earnedGold: 0,
    });
  },
}));
