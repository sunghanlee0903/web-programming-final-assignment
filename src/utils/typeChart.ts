// Pokémon Type Matchup Chart (18 types)
// 2.0 = Super Effective, 0.5 = Not Very Effective, 0.0 = Immune, 1.0 = Neutral

export const typeChart: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0.0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2.0, ice: 2.0, bug: 2.0, rock: 0.5, dragon: 0.5, steel: 2.0 },
  water: { fire: 2.0, water: 0.5, grass: 0.5, ground: 2.0, rock: 2.0, dragon: 0.5 },
  grass: { fire: 0.5, water: 2.0, grass: 0.5, poison: 0.5, ground: 2.0, flying: 0.5, bug: 0.5, rock: 2.0, dragon: 0.5, steel: 0.5 },
  electric: { water: 2.0, grass: 0.5, electric: 0.5, ground: 0.0, flying: 2.0, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2.0, ice: 0.5, ground: 2.0, flying: 2.0, dragon: 2.0, steel: 0.5 },
  fighting: { normal: 2.0, ice: 2.0, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2.0, ghost: 0.0, dark: 2.0, steel: 2.0, fairy: 0.5 },
  poison: { grass: 2.0, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0.0, fairy: 2.0 },
  ground: { fire: 2.0, grass: 0.5, electric: 2.0, poison: 2.0, flying: 0.0, bug: 0.5, rock: 2.0, steel: 2.0 },
  flying: { grass: 2.0, electric: 0.5, fighting: 2.0, bug: 2.0, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2.0, poison: 2.0, psychic: 0.5, steel: 0.5, dark: 0.0 },
  bug: { fire: 0.5, grass: 2.0, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2.0, ghost: 0.5, dark: 2.0, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2.0, ice: 2.0, fighting: 0.5, ground: 0.5, flying: 2.0, bug: 2.0, steel: 0.5 },
  ghost: { normal: 0.0, psychic: 2.0, ghost: 2.0, dark: 0.5 },
  dragon: { dragon: 2.0, steel: 0.5, fairy: 0.0 },
  dark: { fighting: 0.5, psychic: 2.0, ghost: 2.0, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, ice: 2.0, rock: 2.0, steel: 0.5, fairy: 2.0 },
  fairy: { fire: 0.5, fighting: 2.0, poison: 0.5, dragon: 2.0, dark: 2.0, steel: 0.5 }
};

export interface TypeEffectivenessResult {
  multiplier: number;
  message: string;
}

/**
 * Calculates the type effectiveness of an attack type against the defender's types
 */
export const getTypeEffectiveness = (
  attackType: string,
  defenseTypes: string[]
): TypeEffectivenessResult => {
  const atk = attackType.toLowerCase();
  let multiplier = 1.0;

  defenseTypes.forEach(defType => {
    const def = defType.toLowerCase();
    if (typeChart[atk] && typeChart[atk][def] !== undefined) {
      multiplier *= typeChart[atk][def];
    }
  });

  let message = '';
  if (multiplier > 1.0) {
    message = '효과가 굉장했다!';
  } else if (multiplier === 0.0) {
    message = '효과가 없는 듯하다...';
  } else if (multiplier < 1.0) {
    message = '효과가 별로인 듯하다...';
  }

  return { multiplier, message };
};
