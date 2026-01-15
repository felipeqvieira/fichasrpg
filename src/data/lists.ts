// Listas de Regras do D&D 5e

export const DAMAGE_TYPES = [
  'Ácido', 'Concussivo', 'Cortante', 'Elétrico', 'Frio', 'Fogo', 
  'Força', 'Necrótico', 'Perfurante', 'Psíquico', 'Radiante', 
  'Trovejante', 'Venenoso'
];

export const SPECIAL_MATERIALS = [
  'Adamantina', 'Mágico', 'Prata'
];

export const CONDITIONS = [
  'Agarrado', 'Amaldiçoado', 'Amedrontado', 'Atordoado', 'Caído', 'Caindo', 
  'Cego', 'Desidratado', 'Desnutrido', 'Doente', 'Encantado', 'Envenenado', 
  'Exausto', 'Incapacitado', 'Inconsciente', 'Invisível', 'Paralisado', 
  'Petrificado', 'Queimando', 'Restrito', 'Sangrando', 'Silenciado', 
  'Sufocado', 'Surdo', 'Surpreso', 'Transformado'
];

export const ARMOR_TYPES = {
  light: ['Acolchoada', 'Couro', 'Couro Batido'],
  medium: ['Peles', 'Camisão', 'Brunea', 'Peitoral', 'Meia-Armadura'],
  heavy: ['Anéis', 'Cota', 'Malha', 'Talas', 'Placas'],
  shield: ['Escudo']
};

export const WEAPON_TYPES = {
  simple: [
    'Clava', 'Adaga', 'Dardo', 'Grande Clava', 'Machadinha', 'Azagaia', 
    'Martelo Leve', 'Maça', 'Bordão', 'Foice', 'Lança', 'Besta Leve', 
    'Arco Curto', 'Funda'
  ],
  martial: [
    'Machado Batalha', 'Mangual', 'Glaive', 'Machado Grande', 'Espada Grande', 
    'Alabarda', 'Lança Montada', 'Espada Longa', 'Marreta', 'Maça Estrela', 
    'Pique', 'Rapieira', 'Cimitarra', 'Espada Curta', 'Tridente', 'Picareta', 
    'Martelo Guerra', 'Chicote', 'Zarabatana', 'Besta Mão', 'Besta Pesada', 
    'Arco Longo', 'Rede'
  ],
  firearms: ['Pistola', 'Mosquete']
};

export const LANGUAGES = {
  standard: ['Comum', 'Anão', 'Élfico', 'Gigante', 'Gnomico', 'Goblin', 'Pequenino', 'Orc', 'Dracônico', 'Libras'],
  exotic: ['Celestial', 'Abissal', 'Infernal', 'Primordial', 'Silvestre', 'Subcomum', 'Profundo', 'Druídico', 'Gíria Ladino', 'Aarakocra', 'Gith', 'Gnoll'],
  special: ['Telepatia'] // Exige range
};

export const SENSES = [
  'Percepção às Cegas', 'Visão no Escuro', 'Sentido Sísmico', 'Visão Verdadeira'
];