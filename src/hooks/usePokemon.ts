import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Pokemon } from '../types/pokemon';
import { getPokemonKoreanName } from '../utils/pokemonMapper';
import { getMovesForPokemon } from '../utils/moveDb';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Helper to map API response to our custom Pokemon interface
export const mapApiPokemonToCustom = (apiData: any): Pokemon => {
  const statsMap: Record<string, number> = {};
  apiData.stats.forEach((s: any) => {
    statsMap[s.stat.name] = s.base_stat;
  });

  const types = apiData.types.map((t: any) => t.type.name);
  const id = apiData.id;
  const name = apiData.name;
  
  // Resolve Korean Name
  const koreanName = getPokemonKoreanName(id, name.charAt(0).toUpperCase() + name.slice(1));

  // Determine base stats, fallback if some stat names differ
  const stats = {
    hp: statsMap['hp'] || 50,
    attack: statsMap['attack'] || 50,
    defense: statsMap['defense'] || 50,
    speed: statsMap['speed'] || 50,
  };

  // Get retro moves locally without calling API, ensuring extreme speed
  const moves = getMovesForPokemon(name, types);

  return {
    id,
    name,
    koreanName,
    sprites: {
      front_default: apiData.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      back_default: apiData.sprites.back_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
      front_shiny: apiData.sprites.front_shiny,
      back_shiny: apiData.sprites.back_shiny,
    },
    stats,
    types,
    moves,
  };
};

export const useRandomPokemonList = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomPokemons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pick 6 distinct random IDs between 1 and 151
      const ids: number[] = [];
      while (ids.length < 6) {
        const randomId = Math.floor(Math.random() * 151) + 1;
        if (!ids.includes(randomId)) {
          ids.push(randomId);
        }
      }

      // Fetch all 6 in parallel
      const requests = ids.map(id => axios.get(`${POKE_API_BASE_URL}/${id}`));
      const responses = await Promise.all(requests);
      
      const mappedList = responses.map(res => mapApiPokemonToCustom(res.data));
      setPokemonList(mappedList);
    } catch (err: any) {
      console.error(err);
      setError('포켓몬 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomPokemons();
  }, [fetchRandomPokemons]);

  return { pokemonList, loading, error, refresh: fetchRandomPokemons };
};

// Fetch a single pokemon helper
export const fetchSinglePokemon = async (id: number): Promise<Pokemon> => {
  const res = await axios.get(`${POKE_API_BASE_URL}/${id}`);
  return mapApiPokemonToCustom(res.data);
};
