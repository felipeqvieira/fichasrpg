import { useRef } from 'react';
import { 
  Download, Upload, Trash2, X, Save, 
  Moon, Sun
} from 'lucide-react';
import type { CharacterSheet } from '../../types/dnd';

// --- LISTA PADRÃO DE PERÍCIAS ---
const INITIAL_SKILLS = {
  acrobatics: { proficient: false, attribute: 'dexterity' },
  animal_handling: { proficient: false, attribute: 'wisdom' },
  arcana: { proficient: false, attribute: 'intelligence' },
  athletics: { proficient: false, attribute: 'strength' },
  deception: { proficient: false, attribute: 'charisma' },
  history: { proficient: false, attribute: 'intelligence' },
  insight: { proficient: false, attribute: 'wisdom' },
  intimidation: { proficient: false, attribute: 'charisma' },
  investigation: { proficient: false, attribute: 'intelligence' },
  medicine: { proficient: false, attribute: 'wisdom' },
  nature: { proficient: false, attribute: 'intelligence' },
  perception: { proficient: false, attribute: 'wisdom' },
  performance: { proficient: false, attribute: 'charisma' },
  persuasion: { proficient: false, attribute: 'charisma' },
  religion: { proficient: false, attribute: 'intelligence' },
  sleight_of_hand: { proficient: false, attribute: 'dexterity' },
  stealth: { proficient: false, attribute: 'dexterity' },
  survival: { proficient: false, attribute: 'wisdom' },
};

const EMPTY_CHARACTER: CharacterSheet = {
  id: '',
  name: 'Novo Personagem',
  race: '',
  class: '',
  level: 1,
  background: '',
  alignment: '',
  xp: 0, 

  // Atributos com saveProficiency
  attributes: {
    strength: { value: 10, saveProficiency: false },
    dexterity: { value: 10, saveProficiency: false },
    constitution: { value: 10, saveProficiency: false },
    intelligence: { value: 10, saveProficiency: false },
    wisdom: { value: 10, saveProficiency: false },
    charisma: { value: 10, saveProficiency: false }
  },

  skills: INITIAL_SKILLS as any,

  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { current: 1, total: 1, face: 8 },
  armorClass: 10,
  initiative: 0,
  speed: 9,
  proficiencyBonus: 2,
  
  inventory: [],
  features: [],
  spells: [],
  spellSlots: [
    { level: 1, total: 0, current: 0 },
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
  notes: [],
  activeConditions: [],
  resistances: [],
  immunities: [],
  vulnerabilities: [],
  money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
};

interface SettingsModalProps {
  character: CharacterSheet;
  onUpdate: (data: Partial<CharacterSheet>) => void;
  onClose: () => void;
}

export function SettingsModal({ character, onUpdate, onClose }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE DESCANSO ---
  const handleShortRest = () => {
    if (!confirm("Realizar Descanso Curto?\nIsso recuperará habilidades de 'Recarga Curta'.")) return;

    const newFeatures = character.features.map(f => {
      if (f.recovery === 'short') {
        return { ...f, currentUses: f.maxUses };
      }
      return f;
    });

    onUpdate({ features: newFeatures });
    alert("Descanso Curto realizado!");
    onClose();
  };

  const handleLongRest = () => {
    if (!confirm("Realizar Descanso Longo?\nRecupera Vida, Magias e Habilidades.")) return;

    const newHp = { ...character.hp, current: character.hp.max, temp: 0 };
    
    // Recupera metade dos dados gastos (min 1)
    const recoverDice = Math.max(1, Math.floor(character.hitDice.total / 2));
    const newHitDice = {
      ...character.hitDice,
      current: Math.min(character.hitDice.total, character.hitDice.current + recoverDice)
    };

    const newSpellSlots = character.spellSlots.map(s => ({ ...s, current: s.total }));
    
    const newFeatures = character.features.map(f => {
      if (f.recovery === 'short' || f.recovery === 'long') {
        return { ...f, currentUses: f.maxUses };
      }
      return f;
    });

    onUpdate({
      hp: newHp,
      hitDice: newHitDice,
      spellSlots: newSpellSlots,
      features: newFeatures
    });
    
    alert("Descanso Longo realizado!");
    onClose();
  };

  // --- LÓGICA DE ARQUIVO (BACKUP) ---
  const handleExport = () => {
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(character.name || 'Personagem').replace(/\s+/g, '_')}_Nv${character.level}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.attributes || !json.hp) {
          alert("Arquivo inválido!");
          return;
        }
        if (confirm(`Substituir a ficha atual pela de "${json.name}"?`)) {
          onUpdate(json); 
          onClose();
        }
      } catch (err) {
        alert("Erro ao ler JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- RESETAR FICHA ---
  const handleReset = () => {
    if (confirm("TEM CERTEZA? Isso apagará todos os dados da ficha atual e criará uma ficha em branco nível 1.")) {
      onUpdate(EMPTY_CHARACTER);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Save size={20} className="text-indigo-400"/> Menu do Personagem
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-4 space-y-6">
          
          {/* SEÇÃO DE DESCANSOS */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Descanso & Recuperação</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleShortRest} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 p-3 rounded-lg flex flex-col items-center gap-2 transition-all group">
                <Sun size={24} className="text-orange-400 group-hover:scale-110 transition-transform"/>
                <span className="text-sm font-bold text-slate-200">Descanso Curto</span>
              </button>
              <button onClick={handleLongRest} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 p-3 rounded-lg flex flex-col items-center gap-2 transition-all group">
                <Moon size={24} className="text-indigo-400 group-hover:scale-110 transition-transform"/>
                <span className="text-sm font-bold text-slate-200">Descanso Longo</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800"></div>

          {/* SEÇÃO DE ARQUIVO */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Backup & Dados</h3>
            <div className="space-y-3">
              <button onClick={handleExport} className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-600 p-3 rounded-lg group">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded text-blue-400"><Download size={18}/></div>
                  <div className="text-left"><div className="font-bold text-slate-200 text-sm">Salvar Ficha</div><div className="text-[10px] text-slate-500">Baixar .json</div></div>
                </div>
              </button>

              <button onClick={handleImportClick} className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-600 p-3 rounded-lg group">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded text-green-400"><Upload size={18}/></div>
                  <div className="text-left"><div className="font-bold text-slate-200 text-sm">Carregar Ficha</div><div className="text-[10px] text-slate-500">Importar .json</div></div>
                </div>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
          </div>

          <div className="pt-2">
            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded text-xs font-bold transition-colors">
              <Trash2 size={14}/> Resetar Ficha (Apagar Tudo)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}