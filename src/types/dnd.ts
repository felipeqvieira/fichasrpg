export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface AttributeStat {
  value: number;
  saveProficiency: boolean; 
}

export interface Skill {
  proficient: boolean;
  attribute: Attribute;
  expertise?: boolean;
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

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'tool' | 'loot' | 'other';
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
  actionType?: ActionType; // Para aparecer na aba de combate
}

export type ActionType = 'action' | 'bonus' | 'reaction' | 'other' | 'none';

export interface Feature {
  id: string;
  name: string;
  source: string; // "Raça", "Classe", "Talento"
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
}

export interface SpellSlot {
  level: number;
  total: number;
  current: number;
}

// --- NOVOS TIPOS (CRIATURAS E NOTAS) ---

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
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  speed: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
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

// --- FICHA COMPLETA ATUALIZADA ---

export interface CharacterSheet {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  
  xp: number; // Simplificado para número

  attributes: Record<Attribute, AttributeStat>;
  skills: Record<SkillName, Skill>;

  hp: {
    current: number;
    max: number;
    temp: number;
  };

  hitDice: {
    current: number;
    total: number;
    face: number;
  };

  armorClass: number;
  initiative: number;
  speed: number | string;
  proficiencyBonus: number;

  // Listas de Strings
  activeConditions: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];

  // Inventário e Recursos
  inventory: Item[];
  money: {         
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };

  features: Feature[];
  
  // Magias
  spells: Spell[];
  spellSlots: SpellSlot[];

  // Extras
  creatures: Creature[];
  notes: Note[];
}