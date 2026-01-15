export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export type SkillName = 
  | 'acrobatics' | 'animal_handling' | 'arcana' | 'athletics' 
  | 'deception' | 'history' | 'insight' | 'intimidation' 
  | 'investigation' | 'medicine' | 'nature' | 'perception' 
  | 'performance' | 'persuasion' | 'religion' | 'sleight_of_hand' 
  | 'stealth' | 'survival';

export type ProficiencyLevel = 'none' | 'proficient' | 'expert';

// NOVO TIPO: Tipo de Ação
export type ActionType = 'action' | 'bonus' | 'reaction' | 'other' | 'none';

export interface AttributeStat {
  value: number;
  saveProficiency: boolean;
}

export interface Skill {
  level: ProficiencyLevel;
  attribute: Attribute;
}

export interface ItemEffect {
  type: 'ac' | 'attribute' | 'save' | 'skill' | 'damage' | 'speed' | 'other';
  target?: string;
  value: number;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  type: 'weapon' | 'armor' | 'consumable' | 'gear';
  equipped: boolean;
  description?: string;
  damage?: string;
  
  // Adicione este campo:
  range?: string; 

  actionType?: ActionType; 
  effects?: ItemEffect[]; 
}

export interface Sense {
  name: string;
  range: number;
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
}

export interface SpellSlot {
  level: number;
  total: number;
  current: number;
}

export interface Feature {
  id: string;
  name: string;
  source: string;
  type: 'passive' | 'active';
  maxUses: number;
  currentUses: number;
  recovery: 'short' | 'long' | 'none';
  description: string;
  
  // Novo campo
  actionType?: ActionType;
  
  effects?: ItemEffect[];
}

export interface CreatureAttack {
  name: string;
  bonus: string; // ex: "+5"
  damage: string; // ex: "1d8 + 3"
  type: string; // ex: "Perfurante"
}

export interface Creature {
  id: string;
  name: string;
  type: string; // ex: "Besta", "Constructo"
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  speed: string;
  // Atributos simplificados (apenas modificadores ou valores, vamos usar valores para ser padrão)
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  attacks: CreatureAttack[];
  notes: string; // Para traços especiais como "Faro Aguçado"
}

export interface Note {
  id: string;
  title: string; // ex: "Sessão 1: A Taverna"
  date: string;  // ex: "14/05/2024"
  content: string;
  tags?: string[];
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
  proficiencyBonus: number;
  
  armorClass: number;
  initiative: number;
  speed: number;

  hp: {
    current: number;
    max: number;
    temp: number;
  };

  hitDice: {
    total: number;
    current: number;
    face: number;
  };

  deathSaves: {
    successes: number;
    failures: number;
  };

  spellcastingAttribute: Attribute;
  
  armorProficiencies: string[];
  weaponProficiencies: string[];
  languages: { name: string; range?: number }[];
  
  resistances: string[];
  vulnerabilities: string[];
  immunities: string[];
  activeConditions: string[];

  senses: Sense[];
  passivePerception: number;
  passiveInvestigation: number;

  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };

  inventory: Item[];
  spells: Spell[];
  spellSlots: SpellSlot[];
  features: Feature[];
  notes: Note[];
  
  // Placeholders
  creatures: Creature[];
  
  bio: string;
  campaignNotes: string;

  mode: 'view' | 'edit';
}