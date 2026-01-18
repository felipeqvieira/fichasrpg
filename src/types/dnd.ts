export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface AttributeStat {
  value: number;
  saveProficiency: boolean;
}

export type ProficiencyLevel = 'none' | 'proficient' | 'expert';

export interface Skill {
  level: ProficiencyLevel;
  attribute: Attribute;
}

export type SkillName = 
  | 'acrobatics' | 'animal_handling' | 'arcana' | 'athletics' 
  | 'deception' | 'history' | 'insight' | 'intimidation' 
  | 'investigation' | 'medicine' | 'nature' | 'perception' 
  | 'performance' | 'persuasion' | 'religion' | 'sleight_of_hand' 
  | 'stealth' | 'survival';

export interface ItemEffect {
  type: 'ac' | 'attribute' | 'damage' | 'save' | 'skill' | 'speed' | 'other';
  target?: string;
  value: number;
}

// CORREÇÃO AQUI: Adicionado 'gear' na lista de tipos
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'tool' | 'loot' | 'gear' | 'other';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  quantity: number;
  weight: number;
  equipped: boolean;
  description?: string;
  effects?: ItemEffect[];
  damage?: string;
  range?: string;
  properties?: string[];
  actionType?: ActionType;
}

export type ActionType = 'action' | 'bonus' | 'reaction' | 'other' | 'none';

export interface Feature {
  id: string;
  name: string;
  source: string;
  type: 'passive' | 'active';
  maxUses: number;
  currentUses: number;
  recovery: 'short' | 'long' | 'none';
  description: string;
  effects?: ItemEffect[];
  actionType?: ActionType;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
  ritual: boolean;
  effects?: ItemEffect[];
}

export interface SpellSlot {
  level: number;
  total: number;
  current: number;
}

export interface CreatureAttack {
  name: string;
  bonus: string;
  damage: string;
  type: string;
}

export interface Creature {
  id: string;
  name: string;
  type: string;
  hp: { current: number; max: number };
  ac: number;
  speed: string;
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  attacks: CreatureAttack[];
  notes: string;
}

export interface Note {
  id: string;
  title: string;
  date: string;
  content: string;
  tags?: string[];
}

export interface Sense {
  name: string;
  range: number;
}

export interface Language {
  name: string;
  range?: number;
}

export interface CharacterSheet {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  xp: number;

  attributes: Record<Attribute, AttributeStat>;
  skills: Record<SkillName, Skill>;

  hp: { current: number; max: number; temp: number };
  hitDice: { current: number; total: number; face: number };

  armorClass: number;
  initiative: number;
  speed: number | string;
  proficiencyBonus: number;

  activeConditions: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  
  armorProficiencies: string[];
  weaponProficiencies: string[];
  languages: Language[];
  senses: Sense[];

  inventory: Item[];
  
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number };

  features: Feature[];
  spells: Spell[];
  spellSlots: SpellSlot[];
  creatures: Creature[];
  notes: Note[];
}