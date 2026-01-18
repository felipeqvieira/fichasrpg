import { useState, useRef, useEffect } from 'react';
import { 
  Sword, Shield, Heart, Zap, Skull, AlertTriangle, 
  ChevronDown, Dna, Trash2, Clock, Activity, Footprints, X 
} from 'lucide-react';
import type { CharacterSheet, Feature, Item } from '../../types/dnd';
import { CONDITIONS, DAMAGE_TYPES, SPECIAL_MATERIALS } from '../../data/lists';

type ListKey = 'activeConditions' | 'resistances' | 'vulnerabilities' | 'immunities';

interface DropdownProps {
  options: { label?: string; items: string[] }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: any;
}
function CombatDropdown({ options, onChange, placeholder = "Selecionar...", icon: Icon }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative flex-1 min-w-[120px]" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-left text-slate-400 flex justify-between items-center hover:border-slate-500 hover:text-white transition-colors">
        <span className="flex items-center gap-2">{Icon && <Icon size={14} />}<span>{placeholder}</span></span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl max-h-60 overflow-y-auto no-scrollbar animate-fadeIn right-0 min-w-[160px]">
          {options.map((group, gIdx) => (
            <div key={gIdx}>
              {group.label && (<div className="px-2 py-1 bg-slate-900/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm">{group.label}</div>)}
              {group.items.map((item) => (
                <button key={item} onClick={() => { onChange(item); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white border-l-2 border-transparent hover:border-indigo-500 transition-colors">
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CombatTabProps {
  character: CharacterSheet;
  onUpdateHP: (newVal: number) => void;
  onUpdateCharacter?: (updates: Partial<CharacterSheet>) => void;
  isEditMode: boolean;
}

export function CombatTab({ character, onUpdateHP, onUpdateCharacter, isEditMode }: CombatTabProps) {
  const [hpInput, setHpInput] = useState('');
  
  // Listas
  const conditionOptions = [{ items: CONDITIONS }];
  const damageOptions = [{ label: 'Dano', items: DAMAGE_TYPES }, { label: 'Materiais', items: SPECIAL_MATERIALS }];
  const immunityOptions = [{ label: 'Dano', items: DAMAGE_TYPES }, { label: 'Condições', items: CONDITIONS }];

  // --- CALCULO INICIATIVA AUTOMÁTICA ---
  const dexMod = Math.floor((character.attributes.dexterity.value - 10) / 2);

  // Handlers HP
  const handleApplyHP = (type: 'damage' | 'heal') => {
    const value = parseInt(hpInput);
    if (isNaN(value) || value <= 0) return;
    if (type === 'heal') {
      const newCurrent = Math.min(character.hp.max, character.hp.current + value);
      onUpdateCharacter ? onUpdateCharacter({ hp: { ...character.hp, current: newCurrent } }) : onUpdateHP(newCurrent);
    } else {
      let dmg = value, temp = character.hp.temp, cur = character.hp.current;
      if (temp > 0) { if (dmg >= temp) { dmg -= temp; temp = 0; } else { temp -= dmg; dmg = 0; } }
      if (dmg > 0) cur = Math.max(0, cur - dmg);
      onUpdateCharacter ? onUpdateCharacter({ hp: { ...character.hp, current: cur, temp } }) : onUpdateHP(cur);
    }
    setHpInput('');
  };
  const handleTempHP = (v: number) => onUpdateCharacter?.({ hp: { ...character.hp, temp: Math.max(0, v) } });
  
  // Handlers Listas
  const addToList = (k: ListKey, v: string) => { 
    if (!v) return; 
    const list = character[k] || [];
    if (!list.includes(v)) onUpdateCharacter?.({ [k]: [...list, v] }); 
  };
  const removeFromList = (k: ListKey, i: number) => { 
    const list = character[k] || []; 
    onUpdateCharacter?.({ [k]: list.filter((_, idx) => idx !== i) }); 
  };

  const useHitDie = () => { if (character.hitDice.current > 0) onUpdateCharacter?.({ hitDice: { ...character.hitDice, current: character.hitDice.current - 1 } }); };
  const recoverHitDie = () => { if (character.hitDice.current < character.hitDice.total) onUpdateCharacter?.({ hitDice: { ...character.hitDice, current: character.hitDice.current + 1 } }); };

  // ... (HANDLERS DE AÇÕES E AGRUPAMENTOS IGUAIS AO ANTERIOR) ...
  const handleUseFeature = (feat: Feature) => {
    if (feat.currentUses > 0) {
      const updated = character.features.map(f => f.id === feat.id ? { ...f, currentUses: f.currentUses - 1 } : f);
      onUpdateCharacter?.({ features: updated });
    }
  };
  const handleRecoverFeature = (feat: Feature) => {
    if (feat.currentUses < feat.maxUses) {
      const updated = character.features.map(f => f.id === feat.id ? { ...f, currentUses: f.currentUses + 1 } : f);
      onUpdateCharacter?.({ features: updated });
    }
  };
  const handleDeleteFeature = (id: string) => {
    if(confirm('Remover esta habilidade?')) onUpdateCharacter?.({ features: character.features.filter(f => f.id !== id) });
  };
  const handleConsumeItem = (item: Item) => {
    if (!confirm(`Consumir 1x ${item.name}?`)) return;
    if (item.quantity > 1) {
      const updated = character.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
      onUpdateCharacter?.({ inventory: updated });
    } else {
      onUpdateCharacter?.({ inventory: character.inventory.filter(i => i.id !== item.id) });
    }
  };

  const weapons = character.inventory.filter(i => i.type === 'weapon' && i.equipped);
  const consumables = character.inventory.filter(i => i.type === 'consumable');
  const activeFeatures = character.features.filter(f => f.type === 'active');
  const passiveFeatures = character.features.filter(f => f.type === 'passive');

  const getActionGroup = (type: string) => {
    const w = weapons.filter(i => (i.actionType || 'action') === type);
    const c = consumables.filter(i => (i.actionType || 'action') === type);
    const f = activeFeatures.filter(i => (i.actionType || 'action') === type);
    return { weapons: w, consumables: c, features: f };
  };

  const actions = getActionGroup('action');
  const bonusActions = getActionGroup('bonus');
  const reactions = getActionGroup('reaction');
  const others = getActionGroup('other');

  const renderActionSection = (title: string, icon: any, group: { weapons: Item[], consumables: Item[], features: Feature[] }, forceShow = false) => {
    const isEmpty = group.weapons.length === 0 && group.consumables.length === 0 && group.features.length === 0;
    if (isEmpty && !forceShow) return null;
    return (
      <div className="mb-6 animate-in slide-in-from-bottom-2 duration-300">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2 border-b border-slate-800 pb-1">{icon} {title}</h3>
        <div className="space-y-2">
          {group.weapons.map(w => (
            <div key={w.id} className="bg-slate-800 border-l-4 border-slate-600 rounded-r p-2 flex justify-between items-center hover:bg-slate-700/50 transition-colors">
              <div><div className="font-bold text-slate-200 text-sm">{w.name}</div><div className="text-[10px] text-slate-500">{w.damage || '1d4'} • {w.range || '1.5m'}</div></div>
              <div className="text-right"><div className="text-sm font-bold text-white bg-slate-700 px-2 py-0.5 rounded border border-slate-600">+{Math.floor((character.attributes.strength.value - 10)/2) + character.proficiencyBonus}</div></div>
            </div>
          ))}
          {group.features.map(f => (
            <div key={f.id} className="bg-slate-800 border border-slate-700 rounded p-2 hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-indigo-300 text-sm">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase text-slate-500 font-bold border border-slate-700 px-1 rounded">{f.recovery === 'short' ? 'Curto' : 'Longo'}</span>
                  {isEditMode && <button onClick={() => handleDeleteFeature(f.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={12}/></button>}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{f.description}</p>
              <div className="flex flex-wrap gap-1.5 justify-end mt-2 pt-2 border-t border-slate-700/30">
                {Array.from({ length: f.maxUses }).map((_, i) => (
                   <button key={i} onClick={() => { if (i < f.currentUses) handleUseFeature(f); else if (isEditMode) handleRecoverFeature(f); }} disabled={!isEditMode && i >= f.currentUses} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-sm ${i < f.currentUses ? 'bg-yellow-500 border-yellow-600 hover:bg-yellow-400' : 'bg-slate-900 border-slate-700 opacity-50'} ${(isEditMode || i < f.currentUses) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                     {i < f.currentUses && <Zap size={12} className="text-black fill-black" />}
                   </button>
                ))}
              </div>
            </div>
          ))}
          {group.consumables.map(c => (
            <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded p-2 flex justify-between items-center">
              <div className="flex items-center gap-2"><div className="text-xs font-bold text-slate-300">{c.name}</div><div className="text-[9px] bg-slate-900 px-1 rounded text-slate-500">x{c.quantity}</div></div>
              <button onClick={() => handleConsumeItem(c)} className="text-[10px] font-bold text-yellow-500 hover:text-yellow-300 border border-yellow-900/30 bg-yellow-900/10 px-2 py-1 rounded">USAR</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hpPercent = Math.min(100, Math.max(0, (character.hp.current / character.hp.max) * 100));
  const hpColor = hpPercent < 30 ? 'bg-red-600' : hpPercent < 60 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="pb-24">
      
      {/* === 1. NUMEROS FIXOS === */}
      <div className="grid grid-cols-3 gap-2 mb-4">
         <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center shadow-sm flex flex-col items-center justify-center relative">
           <Shield size={20} className="text-slate-500 mb-1" />
           {isEditMode ? (
             <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded text-center text-xl font-bold text-white" value={character.armorClass} onChange={e => onUpdateCharacter?.({ armorClass: parseInt(e.target.value)||10 })} />
           ) : (
             <div className="text-2xl font-bold text-white leading-none">{character.armorClass}</div>
           )}
           <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">CA</div>
         </div>

         {/* INICIATIVA (Automática por Dex) */}
         <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center shadow-sm flex flex-col items-center justify-center">
           <Zap size={20} className="text-yellow-600 mb-1" />
           <div className="text-2xl font-bold text-white leading-none">{dexMod >= 0 ? `+${dexMod}` : dexMod}</div>
           <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Inic (Dex)</div>
         </div>

         {/* DESLOCAMENTO (Editável) */}
         <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center shadow-sm flex flex-col items-center justify-center">
           <Footprints size={20} className="text-slate-500 mb-1" />
           {isEditMode ? (
             <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded text-center text-sm font-bold text-white" value={character.speed} onChange={e => onUpdateCharacter?.({ speed: e.target.value })} />
           ) : (
             <div className="text-2xl font-bold text-white leading-none">{character.speed}m</div>
           )}
           <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Desl</div>
         </div>
      </div>

      {/* === 2. VITALIDADE (Edição de Max HP) === */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 shadow-sm mb-6">
        <div className="flex justify-between text-xs font-bold uppercase text-slate-400 mb-1 px-1">
            <span>Vida</span>
            {isEditMode ? (
              <div className="flex items-center gap-1">
                 Máx: <input type="number" className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-white" value={character.hp.max} onChange={e => onUpdateCharacter?.({ hp: { ...character.hp, max: parseInt(e.target.value)||1 } })} />
              </div>
            ) : (
              <span className={character.hp.current < character.hp.max / 2 ? "text-red-400 animate-pulse" : "text-slate-300"}>
                {character.hp.current} / {character.hp.max} {character.hp.temp > 0 && <span className="text-blue-400">(+{character.hp.temp})</span>}
              </span>
            )}
        </div>
        <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-700 mb-3 relative">
            <div className={`h-full transition-all duration-500 ${hpColor}`} style={{ width: `${hpPercent}%` }}></div>
        </div>
        <div className="flex gap-2 mb-4">
           <input type="number" placeholder="Valor" className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-2 text-sm text-center text-white outline-none focus:border-indigo-500 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={hpInput} onChange={e => setHpInput(e.target.value)} />
           <button onClick={() => handleApplyHP('damage')} className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/40 rounded py-1 text-xs font-bold transition-colors flex items-center justify-center gap-1"><Sword size={14}/> DANO</button>
           <button onClick={() => handleApplyHP('heal')} className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-200 border border-green-900/40 rounded py-1 text-xs font-bold transition-colors flex items-center justify-center gap-1"><Heart size={14}/> CURA</button>
           <div className="flex items-center gap-1 bg-slate-950 px-2 rounded border border-slate-800 ml-1">
             <span className="text-[9px] font-bold text-blue-400">TMP</span>
             <input type="number" className="w-8 bg-transparent text-center text-xs text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={character.hp.temp} onChange={e => handleTempHP(parseInt(e.target.value)||0)} />
           </div>
        </div>
        <div className="flex items-center justify-center gap-3 bg-slate-950/30 py-2 rounded border border-slate-800/50">
           <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Dados de Vida</span>
           <button onClick={useHitDie} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center border border-slate-700 transition-colors" disabled={character.hitDice.current <= 0}>-</button>
           <span className="text-sm font-bold text-slate-200 w-8 text-center">{character.hitDice.current}</span>
           <button onClick={recoverHitDie} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center border border-slate-700 transition-colors" disabled={character.hitDice.current >= character.hitDice.total}>+</button>
           <span className="text-[10px] text-slate-600 font-bold ml-1">d{character.hitDice.face}</span>
        </div>
      </div>

      {/* 3. LISTAS DE STATUS ... */}
      <div className="space-y-3 mb-8">
        
        {/* Condições */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded px-3 py-2 flex flex-col gap-2">
           <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Skull size={14}/> Condições</h4>
              {isEditMode && <div className="min-w-[120px]"><CombatDropdown options={conditionOptions} value="" onChange={(v) => addToList('activeConditions', v)} placeholder="+ Adicionar" /></div>}
           </div>
           <div className="flex flex-wrap gap-2">
             {(!character.activeConditions || character.activeConditions.length === 0) && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
             {character.activeConditions?.map((c, i) => (
               <span key={i} className="text-xs font-bold px-2 py-1 bg-red-900/20 text-red-300 border border-red-900/50 rounded flex items-center gap-1">
                 {c} {isEditMode && <button onClick={() => removeFromList('activeConditions', i)}><X size={12}/></button>}
               </span>
             ))}
           </div>
        </div>
        {/* Resistências, Vulnerabilidades, Imunidades seguem o mesmo padrão... */}
         <div className="bg-slate-800/40 border border-slate-700/50 rounded px-3 py-2 flex flex-col gap-2">
           <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Shield size={14}/> Resistências</h4>
              {isEditMode && <div className="min-w-[120px]"><CombatDropdown options={damageOptions} value="" onChange={(v) => addToList('resistances', v)} placeholder="+ Adicionar" /></div>}
           </div>
           <div className="flex flex-wrap gap-2">
             {(!character.resistances || character.resistances.length === 0) && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
             {character.resistances?.map((r, i) => (
               <span key={i} className="text-xs font-bold px-2 py-1 bg-blue-900/20 text-blue-300 border border-blue-900/50 rounded flex items-center gap-1">
                 {r} {isEditMode && <button onClick={() => removeFromList('resistances', i)}><X size={12}/></button>}
               </span>
             ))}
           </div>
        </div>
         <div className="bg-slate-800/40 border border-slate-700/50 rounded px-3 py-2 flex flex-col gap-2">
           <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><AlertTriangle size={14}/> Vulnerabilidades</h4>
              {isEditMode && <div className="min-w-[120px]"><CombatDropdown options={damageOptions} value="" onChange={(v) => addToList('vulnerabilities', v)} placeholder="+ Adicionar" /></div>}
           </div>
           <div className="flex flex-wrap gap-2">
             {(!character.vulnerabilities || character.vulnerabilities.length === 0) && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
             {character.vulnerabilities?.map((v, i) => (
               <span key={i} className="text-xs font-bold px-2 py-1 bg-yellow-900/20 text-yellow-300 border border-yellow-900/50 rounded flex items-center gap-1">
                 {v} {isEditMode && <button onClick={() => removeFromList('vulnerabilities', i)}><X size={12}/></button>}
               </span>
             ))}
           </div>
        </div>
         <div className="bg-slate-800/40 border border-slate-700/50 rounded px-3 py-2 flex flex-col gap-2">
           <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Dna size={14}/> Imunidades</h4>
              {isEditMode && <div className="min-w-[120px]"><CombatDropdown options={immunityOptions} value="" onChange={(v) => addToList('immunities', v)} placeholder="+ Adicionar" /></div>}
           </div>
           <div className="flex flex-wrap gap-2">
             {(!character.immunities || character.immunities.length === 0) && !isEditMode && <span className="text-xs text-slate-600 italic">Nenhuma</span>}
             {character.immunities?.map((im, i) => (
               <span key={i} className="text-xs font-bold px-2 py-1 bg-green-900/20 text-green-300 border border-green-900/50 rounded flex items-center gap-1">
                 {im} {isEditMode && <button onClick={() => removeFromList('immunities', i)}><X size={12}/></button>}
               </span>
             ))}
           </div>
        </div>
      </div>

      {renderActionSection("Ação", <Sword size={16} className="text-red-400"/>, actions, true)}
      
      {/* Ataque Desarmado */}
      <div className="bg-slate-800/50 border-l-4 border-slate-600 rounded-r p-2 flex justify-between items-center mb-6 opacity-80 hover:opacity-100">
         <div>
           <div className="font-bold text-slate-300 text-sm">Ataque Desarmado</div>
           <div className="text-[10px] text-slate-500">1 + FOR • 1.5m</div>
         </div>
         <div className="text-right">
            <div className="text-xs font-bold text-slate-400">+{Math.floor((character.attributes.strength.value - 10)/2) + character.proficiencyBonus}</div>
         </div>
      </div>

      {renderActionSection("Ação Bônus", <Zap size={16} className="text-yellow-400"/>, bonusActions)}
      {renderActionSection("Reação", <Clock size={16} className="text-blue-400"/>, reactions)}
      {renderActionSection("Passivas & Outros", <Activity size={16} className="text-slate-400"/>, others)}
      
      {passiveFeatures.length > 0 && (
         <div className="mb-6 opacity-80">
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-2 border-b border-slate-800 pb-1">
              <Activity size={14}/> Passivas de Classe
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {passiveFeatures.map(f => (
                <div key={f.id} className="bg-slate-900 border border-slate-800 p-2 rounded relative group">
                  <span className="text-xs font-bold text-slate-400 block pr-4">{f.name}</span>
                  {f.effects?.some(e => e.type === 'speed') && <span className="text-[9px] text-indigo-400 font-bold block">Modifica Deslocamento</span>}
                </div>
              ))}
            </div>
         </div>
      )}
    </div>
  );
}