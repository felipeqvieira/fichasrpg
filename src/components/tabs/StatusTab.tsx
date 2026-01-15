import { useState, useRef, useEffect } from 'react';
import { Shield, Swords, Brain, ChevronUp, ChevronDown, Plus, X, Eye, Ear, MessageCircle, Check } from 'lucide-react';
import type { CharacterSheet, Attribute, SkillName, ProficiencyLevel } from '../../types/dnd';
import { ARMOR_TYPES, WEAPON_TYPES, LANGUAGES, SENSES } from '../../data/lists';

// --- HELPER COMPONENTS ---

// Dropdown Customizado para substituir o <select> nativo e corrigir cores
interface DropdownProps {
  options: { label?: string; items: string[] }[]; // Suporta grupos
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function CustomDropdown({ options, value, onChange, placeholder = "Selecionar..." }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-xs text-left text-slate-200 flex justify-between items-center hover:border-slate-500 focus:outline-none focus:border-red-500 transition-colors"
      >
        <span className={value ? "text-slate-200" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl max-h-60 overflow-y-auto no-scrollbar animate-fadeIn">
          {options.map((group, gIdx) => (
            <div key={gIdx}>
              {group.label && (
                <div className="px-2 py-1 bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between
                    ${value === item 
                      ? 'bg-red-900/30 text-red-200 font-bold' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {item}
                  {value === item && <Check size={12} />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- CONFIGURAÇÃO E DADOS ---

const getModifier = (value: number) => Math.floor((value - 10) / 2);
const formatMod = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const ATTR_NAMES: Record<Attribute, string> = {
  strength: 'Força', dexterity: 'Destreza', constitution: 'Constituição',
  intelligence: 'Inteligência', wisdom: 'Sabedoria', charisma: 'Carisma'
};

const SKILL_NAMES: Record<SkillName, string> = {
  acrobatics: 'Acrobacia', animal_handling: 'Lidar c/ Animais', arcana: 'Arcanismo',
  athletics: 'Atletismo', deception: 'Enganação', history: 'História',
  insight: 'Intuição', intimidation: 'Intimidação', investigation: 'Investigação',
  medicine: 'Medicina', nature: 'Natureza', perception: 'Percepção',
  performance: 'Atuação', persuasion: 'Persuasão', religion: 'Religião',
  sleight_of_hand: 'Prestidigitação', stealth: 'Furtividade', survival: 'Sobrevivência'
};

const CAT_LABELS: Record<string, string> = {
  light: 'Leves', medium: 'Médias', heavy: 'Pesadas', shield: 'Escudos',
  simple: 'Simples', martial: 'Marciais', firearms: 'Fogo'
};

interface StatusTabProps {
  character: CharacterSheet;
  isEditMode: boolean;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
}

export function StatusTab({ character, isEditMode, onUpdate }: StatusTabProps) {
  // Estados locais para inputs
  const [newSenseName, setNewSenseName] = useState('');
  const [newSenseRange, setNewSenseRange] = useState(60);
  const [newLangName, setNewLangName] = useState('');
  const [newLangRange, setNewLangRange] = useState(0);
  const [newArmor, setNewArmor] = useState('');
  const [newWeapon, setNewWeapon] = useState('');

  const sortedSkills = (Object.keys(character.skills) as SkillName[]).sort((a, b) => 
    SKILL_NAMES[a].localeCompare(SKILL_NAMES[b])
  );

  // --- PREPARAÇÃO DAS OPÇÕES PARA OS DROPDOWNS ---
  
  const armorOptions = Object.entries(ARMOR_TYPES).map(([cat, items]) => ({
    label: CAT_LABELS[cat],
    items: [`Todas (${CAT_LABELS[cat]})`, ...items]
  }));

  const weaponOptions = Object.entries(WEAPON_TYPES).map(([cat, items]) => ({
    label: CAT_LABELS[cat],
    items: [`Todas (${CAT_LABELS[cat]})`, ...items]
  }));

  const langOptions = [
    { label: 'Padrão', items: LANGUAGES.standard },
    { label: 'Exótico', items: LANGUAGES.exotic },
    { label: 'Especial', items: LANGUAGES.special }
  ];

  const senseOptions = [
    { label: undefined, items: SENSES }
  ];


  // --- HANDLERS ---
  const handleAttributeChange = (attr: Attribute, val: number) => {
    onUpdate({
      attributes: {
        ...character.attributes,
        [attr]: { ...character.attributes[attr], value: Math.max(1, Math.min(30, val)) }
      }
    });
  };

  const handleSkillToggle = (skillKey: SkillName) => {
    if (!isEditMode) return;
    const current = character.skills[skillKey].level;
    const next: ProficiencyLevel = current === 'none' ? 'proficient' : current === 'proficient' ? 'expert' : 'none';
    onUpdate({
      skills: { ...character.skills, [skillKey]: { ...character.skills[skillKey], level: next } }
    });
  };

  const removeItem = (listKey: 'armorProficiencies' | 'weaponProficiencies' | 'languages' | 'senses', idx: number) => {
    const list = character[listKey];
    onUpdate({ [listKey]: list.filter((_, i) => i !== idx) });
  };

  const addSense = () => {
    if (newSenseName && !character.senses.some(s => s.name === newSenseName)) {
      onUpdate({ senses: [...character.senses, { name: newSenseName, range: newSenseRange }] });
      setNewSenseName('');
      setNewSenseRange(60);
    }
  };

  const addLang = () => {
    if (newLangName && !character.languages.some(l => l.name === newLangName)) {
      const item = newLangName === 'Telepatia' ? { name: newLangName, range: newLangRange || 30 } : { name: newLangName };
      onUpdate({ languages: [...character.languages, item] });
      setNewLangName('');
      setNewLangRange(0);
    }
  };

  const addProficiency = (listKey: 'armorProficiencies' | 'weaponProficiencies', value: string, setter: (v: string) => void) => {
    if (value && !character[listKey].includes(value)) {
      onUpdate({ [listKey]: [...character[listKey], value] });
      setter('');
    }
  };

  // Cálculos Passivos
  const calculatePassive = (skillKey: SkillName, attrKey: Attribute) => {
    const attrVal = character.attributes[attrKey].value;
    const skill = character.skills[skillKey];
    let total = 10 + getModifier(attrVal);
    if (skill.level === 'proficient') total += character.proficiencyBonus;
    if (skill.level === 'expert') total += character.proficiencyBonus * 2;
    return total;
  };
  const passivePerception = calculatePassive('perception', 'wisdom');
  const passiveInvestigation = calculatePassive('investigation', 'intelligence');

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
      
      {/* === COLUNA ESQUERDA === */}
      <div className="md:col-span-5 space-y-6">
        
        {/* Atributos */}
        <div className="space-y-3">
          {(Object.keys(character.attributes) as Attribute[]).map((attrKey) => {
            const attr = character.attributes[attrKey];
            const mod = getModifier(attr.value);
            return (
              <div key={attrKey} className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-800 opacity-60"></div>
                <div className="pl-3 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ATTR_NAMES[attrKey]}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-200">{formatMod(mod)}</span>
                    {isEditMode ? (
                      <div className="flex items-center bg-slate-900 rounded border border-slate-600">
                        <button onClick={() => handleAttributeChange(attrKey, attr.value - 1)} className="px-1.5 hover:bg-slate-700 text-slate-400 hover:text-white"><ChevronDown size={14} /></button>
                        <span className="w-6 text-center text-sm font-mono font-bold text-white">{attr.value}</span>
                        <button onClick={() => handleAttributeChange(attrKey, attr.value + 1)} className="px-1.5 hover:bg-slate-700 text-slate-400 hover:text-white"><ChevronUp size={14} /></button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono bg-slate-900 px-1.5 rounded">{attr.value}</span>
                    )}
                  </div>
                </div>
                <div className="text-right pr-2">
                  <div className={`text-[10px] px-2 py-1 rounded border uppercase font-bold tracking-wider ${
                    attr.saveProficiency ? 'bg-red-900/20 border-red-800/40 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    Save: {formatMod(mod + (attr.saveProficiency ? character.proficiencyBonus : 0))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sentidos Especiais */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm">
           <h3 className="text-xs font-bold text-slate-400 mb-3 border-b border-slate-700 pb-2 flex items-center gap-2 uppercase tracking-widest">
             <Ear size={14} /> Sentidos Especiais
           </h3>
           <div className="flex flex-wrap gap-2 mb-3">
             {character.senses.length === 0 && <span className="text-xs text-slate-500 italic">Nenhum</span>}
             {character.senses.map((sense, idx) => (
               <div key={idx} className="flex items-center bg-slate-900 px-2 py-1 rounded border border-slate-700">
                  <span className="text-xs text-slate-300 font-bold">{sense.name} <span className="font-mono text-slate-500 font-normal ml-1">{sense.range}ft</span></span>
                  {isEditMode && <button onClick={() => removeItem('senses', idx)} className="text-slate-500 hover:text-red-400 ml-2"><X size={12} /></button>}
               </div>
             ))}
           </div>
           
           {isEditMode && (
             <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-600 relative">
                <CustomDropdown 
                  options={senseOptions}
                  value={newSenseName}
                  onChange={setNewSenseName}
                  placeholder="Sentido..."
                />
                
                <input type="number" className="w-10 bg-slate-800 text-center text-xs text-white rounded border border-slate-600 py-1.5 focus:border-red-500 outline-none" 
                  value={newSenseRange} onChange={e => setNewSenseRange(parseInt(e.target.value) || 0)} 
                />
                <span className="text-[10px] text-slate-500">ft</span>
                <button onClick={addSense} className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 text-white"><Plus size={14}/></button>
             </div>
           )}
        </div>

        {/* Proficiências */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm space-y-5">
           
           {/* Armaduras */}
           <div>
             <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Shield size={12}/> Armaduras</h3>
             <div className="flex flex-wrap gap-2 mb-2">
               {character.armorProficiencies.length === 0 && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
               {character.armorProficiencies.map((item, idx) => (
                 <span key={idx} className="px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded border border-slate-700 flex items-center gap-1">
                   {item}
                   {isEditMode && <button onClick={() => removeItem('armorProficiencies', idx)} className="text-slate-500 hover:text-red-400 ml-1"><X size={12} /></button>}
                 </span>
               ))}
             </div>
             {isEditMode && (
               <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-600">
                 <CustomDropdown 
                   options={armorOptions} 
                   value={newArmor} 
                   onChange={setNewArmor} 
                 />
                 <button onClick={() => addProficiency('armorProficiencies', newArmor, setNewArmor)} className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 text-white"><Plus size={14}/></button>
               </div>
             )}
           </div>

           {/* Armas */}
           <div>
             <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Swords size={12}/> Armas</h3>
             <div className="flex flex-wrap gap-2 mb-2">
               {character.weaponProficiencies.length === 0 && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
               {character.weaponProficiencies.map((item, idx) => (
                 <span key={idx} className="px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded border border-slate-700 flex items-center gap-1">
                   {item}
                   {isEditMode && <button onClick={() => removeItem('weaponProficiencies', idx)} className="text-slate-500 hover:text-red-400 ml-1"><X size={12} /></button>}
                 </span>
               ))}
             </div>
             {isEditMode && (
               <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-600">
                 <CustomDropdown 
                   options={weaponOptions} 
                   value={newWeapon} 
                   onChange={setNewWeapon} 
                 />
                 <button onClick={() => addProficiency('weaponProficiencies', newWeapon, setNewWeapon)} className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 text-white"><Plus size={14}/></button>
               </div>
             )}
           </div>

           {/* Idiomas */}
           <div>
             <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><MessageCircle size={12}/> Idiomas</h3>
             <div className="flex flex-wrap gap-2 mb-2">
               {character.languages.map((lang, idx) => (
                 <span key={idx} className="px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded border border-slate-700 flex items-center gap-1 font-serif italic">
                   {lang.name} {lang.name === 'Telepatia' && `(${lang.range}ft)`}
                   {isEditMode && <button onClick={() => removeItem('languages', idx)} className="text-slate-500 hover:text-red-400 ml-1"><X size={12} /></button>}
                 </span>
               ))}
             </div>
             {isEditMode && (
               <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-600">
                  <CustomDropdown 
                    options={langOptions} 
                    value={newLangName} 
                    onChange={setNewLangName}
                    placeholder="Idioma..."
                  />
                  {newLangName === 'Telepatia' && (
                    <input type="number" className="w-10 bg-slate-800 text-center text-xs text-white rounded border border-slate-600 py-1.5 focus:border-red-500 outline-none" 
                      value={newLangRange} onChange={e => setNewLangRange(parseInt(e.target.value) || 0)} 
                    />
                  )}
                  <button onClick={addLang} className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 text-white"><Plus size={14}/></button>
               </div>
             )}
           </div>

        </div>
      </div>

      {/* === COLUNA DIREITA (7/12) === */}
      <div className="md:col-span-7 h-full flex flex-col">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
           <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
             <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
               <Brain size={16} /> Perícias
             </h3>
             <span className="text-xs text-slate-400 font-mono">Proficiência: +{character.proficiencyBonus}</span>
           </div>
           
           <div className="divide-y divide-slate-700/50 flex-1 overflow-y-auto no-scrollbar">
             {sortedSkills.map((skillKey) => {
               const skill = character.skills[skillKey];
               const attrVal = character.attributes[skill.attribute].value;
               let total = getModifier(attrVal);
               if (skill.level === 'proficient') total += character.proficiencyBonus;
               if (skill.level === 'expert') total += character.proficiencyBonus * 2;

               return (
                 <div key={skillKey} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-700/30 transition-colors group">
                   <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleSkillToggle(skillKey)}
                       disabled={!isEditMode}
                       className={`w-3 h-3 rounded-full border transition-all ${
                          skill.level === 'none' ? 'border-slate-500 bg-transparent' : 
                          skill.level === 'expert' ? 'bg-red-500 border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 
                          'bg-slate-400 border-slate-400'
                       } ${isEditMode ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                     />
                     <span className={`text-sm ${skill.level !== 'none' ? 'font-bold text-slate-200' : 'text-slate-400'}`}>
                       {SKILL_NAMES[skillKey]}
                       <span className="ml-1.5 text-[10px] text-slate-500 font-normal uppercase tracking-wider">
                         {skill.attribute.substring(0,3)}
                       </span>
                     </span>
                   </div>
                   <span className={`font-mono font-bold text-sm ${total >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                     {formatMod(total)}
                   </span>
                 </div>
               );
             })}
           </div>

           <div className="bg-slate-900 border-t border-slate-700 p-2 flex justify-around items-center">
              <div className="flex items-center gap-2" title="Percepção Passiva">
                 <Eye size={16} className="text-slate-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Percepção:</span>
                 <span className="text-sm font-bold text-slate-300">{passivePerception}</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2" title="Investigação Passiva">
                 <Brain size={16} className="text-slate-500" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Investigação:</span>
                 <span className="text-sm font-bold text-slate-300">{passiveInvestigation}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}