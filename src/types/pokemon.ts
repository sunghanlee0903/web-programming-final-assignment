export interface Move {
  name: string;
  koreanName: string;
  power: number;
  accuracy: number;
  type: string;
  pp: number;
  maxPp: number;
}

export interface Pokemon {
  id: number;
  name: string;
  koreanName: string;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny?: string;
    back_shiny?: string;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  types: string[];
  moves: Move[];
}

export interface BattleRecord {
  id: string;
  date: string;
  playerPokemonName: string;
  enemyPokemonName: string;
  playerPokemonSprite: string;
  enemyPokemonSprite: string;
  result: 'WIN' | 'LOSE';
  turnsCount: number;
}
