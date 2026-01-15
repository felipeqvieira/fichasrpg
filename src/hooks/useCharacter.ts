import { useState, useEffect, useCallback } from 'react';
import type { CharacterSheet } from '../types/dnd'; // <--- ADICIONADO 'type'
import { loadCharacter, saveCharacter } from '../services/storage';

export function useCharacter() {
  // Inicializa o estado com o que está salvo ou o padrão
  const [character, setCharacter] = useState<CharacterSheet>(loadCharacter());

  // Salva no LocalStorage sempre que o estado 'character' mudar
  useEffect(() => {
    saveCharacter(character);
  }, [character]);

  // Função genérica de atualização profunda
  const updateCharacter = useCallback((updates: Partial<CharacterSheet>) => {
    setCharacter((prev) => {
      // Cria uma nova referência de objeto combinando o anterior com as atualizações
      const newState = { ...prev, ...updates };
      
      // Garante que arrays sejam recriados para disparar a renderização (correção do bug do equipar)
      if (updates.inventory) newState.inventory = [...updates.inventory];
      if (updates.activeConditions) newState.activeConditions = [...updates.activeConditions];
      if (updates.resistances) newState.resistances = [...updates.resistances];
      if (updates.vulnerabilities) newState.vulnerabilities = [...updates.vulnerabilities];
      if (updates.immunities) newState.immunities = [...updates.immunities];
      
      return newState;
    });
  }, []);

  // Função helper para atualizar HP
  const updateHP = useCallback((newCurrent: number) => {
    setCharacter((prev) => ({
      ...prev,
      hp: { ...prev.hp, current: newCurrent }
    }));
  }, []);

  return {
    character,
    updateCharacter,
    updateHP
  };
}