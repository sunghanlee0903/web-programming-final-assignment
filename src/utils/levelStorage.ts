export interface PokemonState {
  level: number;
  exp: number;
}

const STATES_KEY = 'pokemon_player_states';
const GOLD_KEY = 'pokemon_player_gold';
const UNLOCKED_KEY = 'pokemon_unlocked_ids';

// Default starting Pokemons unlocked for all users (Bulbasaur, Charmander, Squirtle, Pikachu)
const DEFAULT_UNLOCKED = [1, 4, 7, 25];
// Max Pokémon database limit (Gen 1 + Gen 2)
export const MAX_POKEMON_COUNT = 251;

// Get the full states table or return an empty record
const getAllPlayerStates = (): Record<number, PokemonState> => {
  try {
    const raw = localStorage.getItem(STATES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to parse pokemon player states from localStorage', e);
    return {};
  }
};

// Save the full states table
const saveAllPlayerStates = (states: Record<number, PokemonState>): void => {
  try {
    localStorage.setItem(STATES_KEY, JSON.stringify(states));
  } catch (e) {
    console.warn('Failed to save pokemon player states to localStorage', e);
  }
};

/**
 * Retrieves the level and exp state of a specific Pokemon ID.
 * Defaults to level 1 and exp 0 if no record exists.
 */
export const getPlayerPokemonState = (id: number): PokemonState => {
  const states = getAllPlayerStates();
  return states[id] || { level: 1, exp: 0 };
};

/**
 * Saves a specific Pokemon ID's level and exp state.
 */
export const savePlayerPokemonState = (id: number, state: PokemonState): void => {
  const states = getAllPlayerStates();
  states[id] = state;
  saveAllPlayerStates(states);
};

/**
 * Calculates the required experience points to reach the next level.
 * Formula: level * 100
 */
export const getRequiredExpForNextLevel = (level: number): number => {
  return level * 100;
};

/**
 * Adds experience points to a Pokemon and triggers level-up logic if needed.
 */
export const addExperience = (
  id: number,
  amount: number
): {
  before: PokemonState;
  after: PokemonState;
  leveledUp: boolean;
  earnedExp: number;
} => {
  const before = getPlayerPokemonState(id);
  let level = before.level;
  let exp = before.exp + amount;
  let leveledUp = false;

  while (exp >= getRequiredExpForNextLevel(level)) {
    exp -= getRequiredExpForNextLevel(level);
    level += 1;
    leveledUp = true;
  }

  const after = { level, exp };
  savePlayerPokemonState(id, after);

  return {
    before,
    after,
    leveledUp,
    earnedExp: amount,
  };
};

/**
 * Retrieves the current player gold amount. Defaults to 0 if not set.
 */
export const getPlayerGold = (): number => {
  try {
    const raw = localStorage.getItem(GOLD_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    console.warn('Failed to parse player gold from localStorage', e);
    return 0;
  }
};

// One-time 1000 gold boost for the user
try {
  const boostKey = 'pokemon_gold_boost_1000_applied';
  const boostApplied = localStorage.getItem(boostKey);
  if (!boostApplied) {
    const raw = localStorage.getItem(GOLD_KEY);
    const goldVal = raw ? parseInt(raw, 10) : 0;
    if (goldVal < 1000) {
      localStorage.setItem(GOLD_KEY, '1000');
    }
    localStorage.setItem(boostKey, 'true');
  }
} catch (e) {
  console.warn('Failed to apply one-time gold boost', e);
}

/**
 * Saves the player gold amount to localStorage.
 */
export const savePlayerGold = (amount: number): void => {
  try {
    localStorage.setItem(GOLD_KEY, String(amount));
  } catch (e) {
    console.warn('Failed to save player gold to localStorage', e);
  }
};

/**
 * Adds a specific amount of gold to player's balance and returns the final balance.
 */
export const addPlayerGold = (amount: number): number => {
  const current = getPlayerGold();
  const next = current + amount;
  savePlayerGold(next);
  return next;
};

/**
 * Deducts gold from player balance. Returns true if successful, false if insufficient gold.
 */
export const spendPlayerGold = (amount: number): boolean => {
  const current = getPlayerGold();
  if (current < amount) return false;
  savePlayerGold(current - amount);
  return true;
};

/**
 * Retrieves the array of unlocked Pokémon IDs.
 * Automatically initializes with basic starters if none exist.
 */
export const getUnlockedPokemonIds = (): number[] => {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    if (!raw) {
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(DEFAULT_UNLOCKED));
      return DEFAULT_UNLOCKED;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse unlocked pokemon list', e);
    return DEFAULT_UNLOCKED;
  }
};

/**
 * Unlocks a specific Pokémon ID.
 */
export const unlockPokemon = (id: number): void => {
  try {
    const unlocked = getUnlockedPokemonIds();
    if (!unlocked.includes(id)) {
      const nextUnlocked = [...unlocked, id].sort((a, b) => a - b);
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(nextUnlocked));
    }
  } catch (e) {
    console.warn('Failed to save unlocked pokemon id', e);
  }
};

/**
 * Checks if a specific Pokémon ID is unlocked.
 */
export const isPokemonUnlocked = (id: number): boolean => {
  return getUnlockedPokemonIds().includes(id);
};

/**
 * Returns the rarity tier for a given Pokémon ID based on its evolution stage and legendary status.
 */
export const getPokemonRarity = (id: number): 'normal' | 'rare' | 'epic' | 'legendary' => {
  const legendaries = new Set([144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251]);
  if (legendaries.has(id)) return 'legendary';

  const epics = new Set([
    3, 6, 9, 12, 15, 18, 26, 31, 34, 36, 40, 45, 62, 65, 68, 71, 76, 94, 
    149, 169, 181, 182, 186, 189, 230, 248
  ]);
  if (epics.has(id)) return 'epic';

  const rares = new Set([
    2, 5, 8, 11, 14, 17, 24, 25, 28, 30, 33, 35, 38, 39, 42, 44, 55, 57, 59, 
    61, 64, 67, 70, 73, 75, 80, 82, 85, 87, 89, 91, 93, 105, 106, 107, 110, 
    112, 117, 119, 121, 130, 134, 135, 136, 148, 162, 164, 166, 168, 171, 
    176, 178, 180, 184, 188, 192, 195, 196, 197, 199, 205, 208, 210, 212, 
    217, 219, 221, 229, 232, 233, 237, 247
  ]);
  if (rares.has(id)) return 'rare';

  return 'normal';
};

const RARITY_WEIGHTS: Record<'normal' | 'rare' | 'epic' | 'legendary', number> = {
  normal: 50,
  rare: 30,
  epic: 15,
  legendary: 5
};

export const getGachaDrawCount = (): number => {
  try {
    const raw = localStorage.getItem('pokemon_gacha_draw_count');
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const saveGachaDrawCount = (count: number): void => {
  try {
    localStorage.setItem('pokemon_gacha_draw_count', String(count));
  } catch (e) {}
};

export const getEpicTickets = (): number => {
  try {
    const raw = localStorage.getItem('pokemon_gacha_epic_tickets');
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const saveEpicTickets = (count: number): void => {
  try {
    localStorage.setItem('pokemon_gacha_epic_tickets', String(count));
  } catch (e) {}
};

export interface DrawResult {
  id: number;
  isDuplicate: boolean;
  ticketEarned: boolean;
}

/**
 * Draws a random Pokémon using weighted probabilities.
 * If useTicket is true, draws from Epic & Legendary pool only.
 * If the drawn Pokémon is already unlocked, increases its level by 1.
 * Increments cumulative gacha draw count and awards 1 Epic+ ticket every 30 normal draws.
 * Returns DrawResult object, or -1 (no tickets), or -2 (insufficient gold).
 */
export const drawRandomPokemon = (useTicket: boolean): DrawResult | -1 | -2 => {
  if (useTicket) {
    const tickets = getEpicTickets();
    if (tickets < 1) return -1; // No tickets available
  } else {
    const gold = getPlayerGold();
    if (gold < 10) return -2; // Insufficient gold
  }

  // Define drawing pool
  const allIds = Array.from({ length: MAX_POKEMON_COUNT }, (_, i) => i + 1);
  let candidates = allIds;
  
  if (useTicket) {
    // Only Epic & Legendary Pokemons
    candidates = allIds.filter(id => {
      const rarity = getPokemonRarity(id);
      return rarity === 'epic' || rarity === 'legendary';
    });
  }

  // Calculate total weight of candidates
  let totalWeight = 0;
  const candidatesWithWeights = candidates.map(id => {
    const rarity = getPokemonRarity(id);
    const weight = RARITY_WEIGHTS[rarity];
    totalWeight += weight;
    return { id, weight };
  });

  // Pick weighted random candidate
  let randomVal = Math.random() * totalWeight;
  let drawnId = candidates[0]; // fallback
  for (const item of candidatesWithWeights) {
    randomVal -= item.weight;
    if (randomVal <= 0) {
      drawnId = item.id;
      break;
    }
  }

  // Deduct resources
  if (useTicket) {
    saveEpicTickets(getEpicTickets() - 1);
  } else {
    spendPlayerGold(10);
  }

  // Check duplicate status
  const unlocked = getUnlockedPokemonIds();
  const isDuplicate = unlocked.includes(drawnId);
  let ticketEarned = false;

  if (isDuplicate) {
    // Already unlocked -> Level Up!
    const state = getPlayerPokemonState(drawnId);
    savePlayerPokemonState(drawnId, { level: state.level + 1, exp: state.exp });
  } else {
    // New unlock!
    unlockPokemon(drawnId);
  }

  // Update draw count and award tickets
  if (!useTicket) {
    const nextCount = getGachaDrawCount() + 1;
    saveGachaDrawCount(nextCount);
    if (nextCount > 0 && nextCount % 30 === 0) {
      saveEpicTickets(getEpicTickets() + 1);
      ticketEarned = true;
    }
  }

  return { id: drawnId, isDuplicate, ticketEarned };
};

const BALLS_KEY = 'pokemon_ball_inventory';
const EQUIPPED_BALL_KEY = 'pokemon_equipped_ball';

export interface BallInventory {
  pokeball: number;
  greatball: number;
  ultraball: number;
}

export const getBallInventory = (): BallInventory => {
  try {
    const raw = localStorage.getItem(BALLS_KEY);
    if (!raw) {
      const initial = { pokeball: 999, greatball: 3, ultraball: 1 };
      localStorage.setItem(BALLS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { pokeball: 999, greatball: 3, ultraball: 1 };
  }
};

export const saveBallInventory = (inv: BallInventory): void => {
  try {
    localStorage.setItem(BALLS_KEY, JSON.stringify(inv));
  } catch (e) {}
};

export const getEquippedBall = (): 'pokeball' | 'greatball' | 'ultraball' => {
  try {
    return (localStorage.getItem(EQUIPPED_BALL_KEY) as any) || 'pokeball';
  } catch (e) {
    return 'pokeball';
  }
};

export const saveEquippedBall = (ball: 'pokeball' | 'greatball' | 'ultraball'): void => {
  try {
    localStorage.setItem(EQUIPPED_BALL_KEY, ball);
  } catch (e) {}
};

export const buyBall = (ballType: 'greatball' | 'ultraball', cost: number): boolean => {
  const gold = getPlayerGold();
  if (gold < cost) return false;
  
  spendPlayerGold(cost);
  const inv = getBallInventory();
  inv[ballType] = (inv[ballType] || 0) + 1;
  saveBallInventory(inv);
  return true;
};

export const consumeEquippedBall = (): void => {
  const ball = getEquippedBall();
  if (ball === 'pokeball') return; // Infinite
  
  const inv = getBallInventory();
  if (inv[ball] > 0) {
    inv[ball]--;
    saveBallInventory(inv);
    if (inv[ball] === 0) {
      saveEquippedBall('pokeball'); // fallback
    }
  }
};

export const buyRareCandy = (pokemonId: number, cost: number): boolean => {
  const gold = getPlayerGold();
  if (gold < cost) return false;
  
  spendPlayerGold(cost);
  const state = getPlayerPokemonState(pokemonId);
  savePlayerPokemonState(pokemonId, { level: state.level + 1, exp: state.exp });
  return true;
};

