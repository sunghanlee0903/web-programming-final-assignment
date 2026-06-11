import type { Move } from '../types/pokemon';
import { getMoveNameKorean } from './pokemonMapper';

export interface MoveDbEntry {
  power: number;
  accuracy: number;
  type: string;
  pp: number;
}

export const localMoveDatabase: Record<string, MoveDbEntry> = {
  'tackle': { power: 40, accuracy: 100, type: 'normal', pp: 35 },
  'scratch': { power: 40, accuracy: 100, type: 'normal', pp: 35 },
  'pound': { power: 40, accuracy: 100, type: 'normal', pp: 35 },
  'gust': { power: 40, accuracy: 100, type: 'flying', pp: 35 },
  'wing-attack': { power: 60, accuracy: 100, type: 'flying', pp: 35 },
  'ember': { power: 40, accuracy: 100, type: 'fire', pp: 25 },
  'flamethrower': { power: 90, accuracy: 100, type: 'fire', pp: 15 },
  'fire-blast': { power: 110, accuracy: 85, type: 'fire', pp: 5 },
  'water-gun': { power: 40, accuracy: 100, type: 'water', pp: 25 },
  'bubble-beam': { power: 65, accuracy: 100, type: 'water', pp: 20 },
  'surf': { power: 90, accuracy: 100, type: 'water', pp: 15 },
  'hydro-pump': { power: 110, accuracy: 80, type: 'water', pp: 5 },
  'vine-whip': { power: 45, accuracy: 100, type: 'grass', pp: 25 },
  'razor-leaf': { power: 55, accuracy: 95, type: 'grass', pp: 25 },
  'giga-drain': { power: 75, accuracy: 100, type: 'grass', pp: 10 },
  'solar-beam': { power: 120, accuracy: 100, type: 'grass', pp: 10 },
  'thunder-shock': { power: 40, accuracy: 100, type: 'electric', pp: 30 },
  'thunderbolt': { power: 90, accuracy: 100, type: 'electric', pp: 15 },
  'thunder': { power: 110, accuracy: 70, type: 'electric', pp: 10 },
  'quick-attack': { power: 40, accuracy: 100, type: 'normal', pp: 30 },
  'bite': { power: 60, accuracy: 100, type: 'dark', pp: 25 },
  'headbutt': { power: 70, accuracy: 100, type: 'normal', pp: 15 },
  'earthquake': { power: 100, accuracy: 100, type: 'ground', pp: 10 },
  'dig': { power: 80, accuracy: 100, type: 'ground', pp: 10 },
  'confusion': { power: 50, accuracy: 100, type: 'psychic', pp: 25 },
  'psychic': { power: 90, accuracy: 100, type: 'psychic', pp: 10 },
  'shadow-ball': { power: 80, accuracy: 100, type: 'ghost', pp: 15 },
  'sludge-bomb': { power: 90, accuracy: 100, type: 'poison', pp: 10 },
  'ice-beam': { power: 90, accuracy: 100, type: 'ice', pp: 10 },
  'blizzard': { power: 110, accuracy: 70, type: 'ice', pp: 5 },
  'hyper-beam': { power: 150, accuracy: 90, type: 'normal', pp: 5 },
  'slash': { power: 70, accuracy: 100, type: 'normal', pp: 20 },
  'drill-peck': { power: 80, accuracy: 100, type: 'flying', pp: 20 },
  'seismic-toss': { power: 60, accuracy: 100, type: 'fighting', pp: 20 },
  'low-kick': { power: 50, accuracy: 100, type: 'fighting', pp: 20 },
  'iron-tail': { power: 100, accuracy: 75, type: 'steel', pp: 15 },
  'signal-beam': { power: 75, accuracy: 100, type: 'bug', pp: 15 },
  'rock-slide': { power: 75, accuracy: 90, type: 'rock', pp: 10 }
};

// Generates 4 moves for a Pokemon based on its types and the local database
export const getMovesForPokemon = (_pokemonName: string, types: string[]): Move[] => {
  const selectedMoves: Move[] = [];
  const lowercaseTypes = types.map(t => t.toLowerCase());

  // 1. Gather all moves matching the Pokemon's types
  const typeMatchingMoves: { name: string; entry: MoveDbEntry }[] = [];
  const normalMoves: { name: string; entry: MoveDbEntry }[] = [];
  const otherMoves: { name: string; entry: MoveDbEntry }[] = [];

  Object.entries(localMoveDatabase).forEach(([name, entry]) => {
    if (lowercaseTypes.includes(entry.type)) {
      typeMatchingMoves.push({ name, entry });
    } else if (entry.type === 'normal') {
      normalMoves.push({ name, entry });
    } else {
      otherMoves.push({ name, entry });
    }
  });

  // 2. Select moves: try to get at least 2 type-matching moves, 1 normal move, and 1 other move
  const addMove = (item: { name: string; entry: MoveDbEntry }) => {
    if (selectedMoves.some(m => m.name === item.name)) return false;
    selectedMoves.push({
      name: item.name,
      koreanName: getMoveNameKorean(item.name),
      power: item.entry.power,
      accuracy: item.entry.accuracy,
      type: item.entry.type,
      pp: item.entry.pp,
      maxPp: item.entry.pp
    });
    return true;
  };

  // Shuffle arrays to get randomness
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const shuffledTypeMoves = shuffle(typeMatchingMoves);
  const shuffledNormalMoves = shuffle(normalMoves);
  const shuffledOtherMoves = shuffle(otherMoves);

  // Grab type moves first
  let added = 0;
  for (const item of shuffledTypeMoves) {
    if (addMove(item)) added++;
    if (added >= 2) break;
  }

  // Grab a normal move
  for (const item of shuffledNormalMoves) {
    if (addMove(item)) break;
  }

  // Fill up to 4 moves from other arrays
  const combinedList = [...shuffledTypeMoves, ...shuffledNormalMoves, ...shuffledOtherMoves];
  for (const item of combinedList) {
    if (selectedMoves.length >= 4) break;
    addMove(item);
  }

  // Fallback: If still less than 4 moves, add Tackle as default
  while (selectedMoves.length < 4) {
    selectedMoves.push({
      name: 'tackle',
      koreanName: getMoveNameKorean('tackle'),
      power: 40,
      accuracy: 100,
      type: 'normal',
      pp: 35,
      maxPp: 35
    });
  }

  return selectedMoves;
};
