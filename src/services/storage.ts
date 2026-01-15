import type { CharacterSheet } from '../types/dnd'; // <--- Import type aqui também

const STORAGE_KEY = 'dnd-character-sheet-v2'; // Mudei a chave para forçar um reset limpo se necessário

const DEFAULT_CHARACTER: CharacterSheet = {
  id: 'char_001',
  name: 'Aldric',
  race: 'Humano',
  class: 'Guerreiro',
  level: 1,
  background: 'Soldado',
  alignment: 'Neutro Bom',
  xp: 0,
  
  // Atributos
  attributes: {
    strength: { value: 16, saveProficiency: true },
    dexterity: { value: 12, saveProficiency: false },
    constitution: { value: 14, saveProficiency: true },
    intelligence: { value: 10, saveProficiency: false },
    wisdom: { value: 12, saveProficiency: false },
    charisma: { value: 10, saveProficiency: false },
  },

  // Perícias
  skills: {
    acrobatics: { level: 'none', attribute: 'dexterity' },
    animal_handling: { level: 'none', attribute: 'wisdom' },
    arcana: { level: 'none', attribute: 'intelligence' },
    athletics: { level: 'proficient', attribute: 'strength' },
    deception: { level: 'none', attribute: 'charisma' },
    history: { level: 'none', attribute: 'intelligence' },
    insight: { level: 'none', attribute: 'wisdom' },
    intimidation: { level: 'proficient', attribute: 'charisma' },
    investigation: { level: 'none', attribute: 'intelligence' },
    medicine: { level: 'none', attribute: 'wisdom' },
    nature: { level: 'none', attribute: 'intelligence' },
    perception: { level: 'proficient', attribute: 'wisdom' },
    performance: { level: 'none', attribute: 'charisma' },
    persuasion: { level: 'none', attribute: 'charisma' },
    religion: { level: 'none', attribute: 'intelligence' },
    sleight_of_hand: { level: 'none', attribute: 'dexterity' },
    stealth: { level: 'none', attribute: 'dexterity' },
    survival: { level: 'proficient', attribute: 'wisdom' },
  },

  proficiencyBonus: 2,
  
  armorClass: 16,
  initiative: 1,
  speed: 9, // Metros (30ft)
  
  hp: {
    current: 12,
    max: 12,
    temp: 0
  },
  
  hitDice: {
    total: 1,
    current: 1,
    face: 10
  },
  
  deathSaves: {
    successes: 0,
    failures: 0
  },

  // NOVOS CAMPOS (Listas)
  armorProficiencies: ['Leves', 'Médias', 'Pesadas', 'Escudos'],
  weaponProficiencies: ['Simples', 'Marciais'],
  languages: [{ name: 'Comum' }, { name: 'Anão' }],
  
  resistances: [],
  vulnerabilities: [],
  immunities: [],
  activeConditions: [],
  
  senses: [],
  passivePerception: 13,
  passiveInvestigation: 10,

  // Outros
  currency: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
  inventory: [
    { 
      id: '1', 
      name: 'Espada Longa', 
      quantity: 1, 
      weight: 1.5, 
      type: 'weapon', 
      equipped: true, 
      description: 'Uma espada versátil.',
      damage: '1d8 Cortante'
    },
    { 
      id: '2', 
      name: 'Cota de Malha', 
      quantity: 1, 
      weight: 25, 
      type: 'armor', 
      equipped: true, 
      description: 'Armadura pesada.' 
    },
    { 
      id: '3', 
      name: 'Poção de Cura', 
      quantity: 2, 
      weight: 0.5, 
      type: 'consumable', 
      equipped: false, 
      description: 'Cura 2d4+2 PV.' 
    }
  ],
  
  spellcastingAttribute: 'intelligence', // Padrão
  
  spells: [],
  
  spellSlots: [
    { level: 1, total: 2, current: 2 }, // Nível 1 começa com 2 slots
    { level: 2, total: 0, current: 0 },
    { level: 3, total: 0, current: 0 },
    { level: 4, total: 0, current: 0 },
    { level: 5, total: 0, current: 0 },
    { level: 6, total: 0, current: 0 },
    { level: 7, total: 0, current: 0 },
    { level: 8, total: 0, current: 0 },
    { level: 9, total: 0, current: 0 },
  ],
  
  creatures: [],
  
  features: [
    {
      id: '1',
      name: 'Retomar o Fôlego',
      source: 'Guerreiro 1',
      type: 'active',
      maxUses: 1,
      currentUses: 1,
      recovery: 'short',
      description: 'Como uma ação bônus, recupere 1d10 + Nível de Guerreiro PV.'
    },
    {
      id: '2',
      name: 'Estilo de Combate (Defesa)',
      source: 'Guerreiro 1',
      type: 'passive',
      maxUses: 0,
      currentUses: 0,
      recovery: 'none',
      description: 'Enquanto estiver usando armadura, ganha +1 na CA.'
    }
  ],
  
  bio: '',
  campaignNotes: '',
  
  mode: 'view'
};

// Exportações Nomeadas (Para funcionar com o import { ... })
export const loadCharacter = (): CharacterSheet => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge simples para garantir que campos novos existam em fichas antigas
      return { ...DEFAULT_CHARACTER, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao carregar ficha:', e);
  }
  return DEFAULT_CHARACTER;
};

export const saveCharacter = (character: CharacterSheet): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  } catch (e) {
    console.error('Erro ao salvar ficha:', e);
  }
};