import { useState, useEffect } from 'react';
import { 
  Backpack, Plus, Trash2, Sword, Shield, 
  FlaskConical, Wrench, Edit2, Check, X, 
  Weight, Search, Coins, Sparkles, Clock, Gem
} from 'lucide-react';
import type { CharacterSheet, Item, ItemEffect, ActionType, Attribute, SkillName, ItemType, Rarity } from '../../types/dnd';

// --- CONSTANTES E LISTAS ---
const ITEM_TYPES: Record<string, { label: string, icon: any }> = {
  weapon: { label: 'Arma', icon: Sword },
  armor: { label: 'Armadura', icon: Shield },
  consumable: { label: 'Consumível', icon: FlaskConical },
  gear: { label: 'Equipamento', icon: Wrench },
  loot: { label: 'Tesouro', icon: Gem },
};

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  very_rare: 'Muito Raro',
  legendary: 'Lendário',
  artifact: 'Artefato'
};

const ACTION_TYPES: Record<string, string> = {
  'action': 'Ação Padrão',
  'bonus': 'Ação Bônus',
  'reaction': 'Reação',
  'other': 'Outro / Nenhum',
  'none': 'Passivo'
};

const EFFECT_TYPES = [
  { value: 'ac', label: 'Classe de Armadura (CA)' },
  { value: 'attribute', label: 'Atributo' },
  { value: 'save', label: 'Teste de Resistência' },
  { value: 'skill', label: 'Perícia' },
  { value: 'damage', label: 'Bônus de Dano' },
  { value: 'speed', label: 'Movimento' },
  { value: 'other', label: 'Outro' },
];

const ATTRIBUTES_OPTS: {value: Attribute, label: string}[] = [
  { value: 'strength', label: 'Força' }, { value: 'dexterity', label: 'Destreza' },
  { value: 'constitution', label: 'Constituição' }, { value: 'intelligence', label: 'Inteligência' },
  { value: 'wisdom', label: 'Sabedoria' }, { value: 'charisma', label: 'Carisma' },
];

const SKILLS_OPTS: {value: SkillName, label: string}[] = [
  { value: 'acrobatics', label: 'Acrobacia' }, { value: 'animal_handling', label: 'Lidar c/ Animais' },
  { value: 'arcana', label: 'Arcanismo' }, { value: 'athletics', label: 'Atletismo' },
  { value: 'deception', label: 'Enganação' }, { value: 'history', label: 'História' },
  { value: 'insight', label: 'Intuição' }, { value: 'intimidation', label: 'Intimidação' },
  { value: 'investigation', label: 'Investigação' }, { value: 'medicine', label: 'Medicina' },
  { value: 'nature', label: 'Natureza' }, { value: 'perception', label: 'Percepção' },
  { value: 'performance', label: 'Atuação' }, { value: 'persuasion', label: 'Persuasão' },
  { value: 'religion', label: 'Religião' }, { value: 'sleight_of_hand', label: 'Prestidigitação' },
  { value: 'stealth', label: 'Furtividade' }, { value: 'survival', label: 'Sobrevivência' }
];

const MOVEMENT_LIST = ['Caminhada', 'Voo', 'Escalada', 'Natação', 'Escavação'];

interface InventoryTabProps {
  character: CharacterSheet;
  isEditMode: boolean;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
}

export function InventoryTab({ character, isEditMode, onUpdate }: InventoryTabProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Item>({
    id: '', 
    name: '', 
    quantity: 1, 
    weight: 0, 
    type: 'gear' as ItemType, 
    rarity: 'common', 
    equipped: false, 
    description: '', 
    damage: '', 
    effects: [], 
    actionType: 'none'
  });

  // Effect States
  const [newEffectType, setNewEffectType] = useState<ItemEffect['type']>('attribute');
  const [newEffectTarget, setNewEffectTarget] = useState('');
  const [newEffectValue, setNewEffectValue] = useState(0);

  // Limpa o alvo ao mudar o tipo
  useEffect(() => {
    setNewEffectTarget('');
  }, [newEffectType]);

  const carryCapacity = character.attributes.strength.value * 7.5;
  const currentWeight = character.inventory.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  const weightPercent = Math.min(100, (currentWeight / carryCapacity) * 100);

  // --- HANDLERS ---

  const handleCurrencyChange = (type: string, value: string) => {
    const val = parseInt(value) || 0;
    // Fallback seguro para evitar erros de tipagem
    const currentCurrency = (character as any).currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    onUpdate({ currency: { ...currentCurrency, [type]: val } } as any);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item permanentemente?')) {
      onUpdate({ inventory: character.inventory.filter(i => i.id !== id) });
    }
  };

  const handleConsume = (item: Item) => {
    if (!confirm(`Deseja consumir 1 unidade de "${item.name}"?`)) return;
    if (item.quantity > 1) {
      const updated = character.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
      onUpdate({ inventory: updated });
    } else {
      onUpdate({ inventory: character.inventory.filter(i => i.id !== item.id) });
    }
  };

  const handleToggleEquip = (item: Item) => {
    const updated = character.inventory.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i);
    onUpdate({ inventory: updated });
  };

  const handleSaveItem = () => {
    if (!formData.name) return;
    let newInventory = [...character.inventory];
    if (editingId) {
      newInventory = newInventory.map(i => i.id === editingId ? { ...formData, id: editingId } : i);
    } else {
      newInventory.push({ ...formData, id: Date.now().toString() });
    }
    onUpdate({ inventory: newInventory });
    resetForm();
  };

  const handleAddEffect = () => {
    if ((newEffectType === 'attribute' || newEffectType === 'skill' || newEffectType === 'save') && !newEffectTarget) return; 
    
    const effect: ItemEffect = { type: newEffectType, target: newEffectTarget, value: newEffectValue };
    setFormData({ ...formData, effects: [...(formData.effects || []), effect] });
    setNewEffectValue(0);
    setNewEffectTarget('');
  };

  const handleRemoveEffect = (idx: number) => {
    setFormData({ ...formData, effects: formData.effects?.filter((_, i) => i !== idx) });
  };

  const startEdit = (item: Item) => {
    setFormData({ ...item, effects: item.effects || [], actionType: item.actionType || 'none' });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: '', 
      name: '', 
      quantity: 1, 
      weight: 0, 
      type: 'gear' as ItemType, 
      rarity: 'common', 
      equipped: false, 
      description: '', 
      damage: '', 
      effects: [], 
      actionType: 'none'
    });
    setNewEffectType('attribute');
    setNewEffectTarget('');
    setNewEffectValue(0);
  };

  // --- RENDERIZADOR DO INPUT DE ALVO ---
  const renderTargetInput = () => {
    if (newEffectType === 'ac') {
        return <input disabled className="w-full bg-slate-900/50 text-xs border border-slate-800 rounded p-1.5 text-slate-500 cursor-not-allowed" value="Armadura" />;
    }

    let options: {value: string, label: string}[] = [];
    
    if (newEffectType === 'attribute' || newEffectType === 'save') options = ATTRIBUTES_OPTS;
    else if (newEffectType === 'skill') options = SKILLS_OPTS;
    else if (newEffectType === 'speed') options = MOVEMENT_LIST.map(m => ({ value: m, label: m }));

    if (options.length > 0) {
        return (
            <select className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white" value={newEffectTarget} onChange={e => setNewEffectTarget(e.target.value)}>
                <option value="" className="bg-slate-800">Selecionar...</option>
                {options.map(o => <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>)}
            </select>
        );
    }

    return <input className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white" placeholder={newEffectType === 'damage' ? "Tipo (ex: Fogo)" : "Detalhe..."} value={newEffectTarget} onChange={e => setNewEffectTarget(e.target.value)} />;
  };

  const filteredItems = character.inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const optionClass = "bg-slate-800 text-slate-200";

  // Fallback seguro para currency
  const currency = (character as any).currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

  return (
    <div className="space-y-6 pb-24">
      {/* PAINEL DE DINHEIRO E CARGA */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-bold uppercase tracking-wider"><Coins size={14} /><span>Tesouro</span></div>
        <div className="grid grid-cols-5 gap-2 mb-4">
           {Object.entries(currency).map(([key, val]) => (
             <div key={key} className={`flex flex-col items-center bg-slate-900 p-2 rounded border border-slate-700 transition-colors ${isEditMode ? 'focus-within:border-yellow-600' : 'opacity-80'}`}>
               <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">{key.toUpperCase()}</label>
               <input type="number" disabled={!isEditMode} className={`w-full bg-transparent text-center font-bold text-slate-200 outline-none ${!isEditMode && 'cursor-default'}`} value={val as number} onChange={(e) => handleCurrencyChange(key, e.target.value)} />
             </div>
           ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold uppercase text-slate-500"><span className="flex items-center gap-1"><Weight size={12}/> Carga</span><span className={currentWeight > carryCapacity ? "text-red-400" : "text-slate-400"}>{currentWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg</span></div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700"><div className={`h-full transition-all duration-500 ${currentWeight > carryCapacity ? 'bg-red-600' : 'bg-slate-400'}`} style={{ width: `${weightPercent}%` }}></div></div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Buscar item..." className="w-full bg-slate-800 border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {isEditMode && (<button onClick={() => setIsAdding(true)} className="bg-red-900/80 hover:bg-red-800 text-white px-3 py-2 rounded border border-red-700 transition-colors shadow-sm animate-in fade-in"><Plus size={20} /></button>)}
        </div>
        <div className="flex bg-slate-800 rounded p-1 border border-slate-700 overflow-x-auto no-scrollbar">
          {['all', 'weapon', 'armor', 'consumable', 'gear'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${filter === f ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{f === 'all' ? 'Tudo' : ITEM_TYPES[f]?.label || f}</button>))}
        </div>
      </div>

      {/* LISTA DE ITENS */}
      <div className="space-y-3">
        {filteredItems.map(item => {
           const TypeIcon = ITEM_TYPES[item.type]?.icon || Backpack;
           const rarityColor = item.rarity === 'common' ? 'text-slate-500' : 
                               item.rarity === 'uncommon' ? 'text-green-400' :
                               item.rarity === 'rare' ? 'text-blue-400' :
                               item.rarity === 'very_rare' ? 'text-purple-400' :
                               item.rarity === 'legendary' ? 'text-orange-400' : 'text-yellow-200';

           return (
             <div key={item.id} className={`bg-slate-800 border rounded-lg p-3 flex items-start gap-3 shadow-sm group ${item.equipped ? 'border-green-900/50' : 'border-slate-700'}`}>
               <div className={`p-2 rounded-lg shrink-0 ${item.equipped ? 'bg-green-900/20 text-green-400' : 'bg-slate-900 text-slate-500'}`}><TypeIcon size={20} /></div>
               <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start">
                    <h4 className={`font-bold truncate ${item.equipped ? 'text-green-300' : 'text-slate-200'}`}>
                        {item.name} 
                        {item.quantity > 1 && <span className="text-slate-500 text-xs ml-1">x{item.quantity}</span>}
                    </h4>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 text-[10px] mt-1 uppercase font-bold tracking-wide">
                   <span className="text-slate-500">{ITEM_TYPES[item.type]?.label}</span>
                   <span className="text-slate-600">•</span>
                   <span className={rarityColor}>{RARITY_LABELS[item.rarity || 'common']}</span>
                   <span className="text-slate-600">•</span>
                   <span className="text-slate-500">{item.weight} kg</span>
                   {item.damage && <span className="text-red-400 ml-1">• {item.damage}</span>}
                   
                   {item.actionType && item.actionType !== 'none' && item.actionType !== 'other' && (
                     <span className="text-yellow-500 border border-yellow-900/50 px-1 rounded bg-yellow-900/10 ml-1">
                       {item.actionType === 'action' ? 'AÇÃO' : item.actionType === 'bonus' ? 'BÔNUS' : 'REAÇÃO'}
                     </span>
                   )}
                 </div>

                 {/* Efeitos */}
                 {item.effects && item.effects.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {item.effects.map((eff, i) => (
                       <span key={i} className="px-1.5 py-0.5 bg-blue-900/30 border border-blue-800 rounded text-[10px] text-blue-200 font-bold flex items-center gap-1">
                         {eff.type === 'ac' ? 'CA' : (SKILLS_OPTS.find(s=>s.value===eff.target)?.label || ATTRIBUTES_OPTS.find(a=>a.value===eff.target)?.label || eff.target || eff.type).substring(0, 10).toUpperCase()} 
                         <span className={eff.value >= 0 ? "text-blue-200" : "text-red-300"}>{eff.value >= 0 ? `+${eff.value}` : eff.value}</span>
                       </span>
                     ))}
                   </div>
                 )}
                 {item.description && (<p className="text-xs text-slate-400 mt-1.5 italic line-clamp-2">{item.description}</p>)}
               </div>
               
               {/* Ações */}
               <div className="flex flex-col gap-1 pl-2 border-l border-slate-700/50">
                  {item.type === 'consumable' && (<button onClick={() => handleConsume(item)} className="p-1.5 rounded text-yellow-500 hover:bg-yellow-900/20 transition-colors" title="Consumir / Usar"><FlaskConical size={16} /></button>)}
                  <button onClick={() => handleToggleEquip(item)} className={`p-1.5 rounded transition-colors ${item.equipped ? 'text-green-400 bg-green-900/20' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-700'}`} title={item.equipped ? "Desequipar" : "Equipar"}><Check size={16} /></button>
                  {isEditMode && (<><button onClick={() => startEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"><Edit2 size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"><Trash2 size={16} /></button></>)}
               </div>
             </div>
           );
        })}
      </div>

      {/* MODAL EDITAR ITEM */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-5 animate-in slide-in-from-bottom-10 fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3"><h3 className="text-lg font-bold text-white flex items-center gap-2">{editingId ? <Edit2 size={18}/> : <Plus size={18}/>} {editingId ? 'Editar Item' : 'Novo Item'}</h3><button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20}/></button></div>
             <div className="space-y-4">
               
               {/* Nome e Qtd */}
               <div className="flex gap-3"><div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Nome</label><input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus /></div><div className="w-20"><label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Qtd</label><input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none text-center" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} /></div></div>
               
               {/* Tipo, Raridade e Peso */}
               <div className="flex gap-3">
                   <div className="flex-1">
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Tipo</label>
                       <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ItemType})}>
                           {Object.entries(ITEM_TYPES).map(([key, val]) => (<option key={key} value={key} className={optionClass}>{val.label}</option>))}
                       </select>
                   </div>
                   <div className="flex-1">
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Raridade</label>
                       <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value as Rarity})}>
                           {Object.entries(RARITY_LABELS).map(([key, label]) => (<option key={key} value={key} className={optionClass}>{label}</option>))}
                       </select>
                   </div>
                   <div className="w-20">
                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Peso (kg)</label>
                       <input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none text-center" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})} />
                   </div>
               </div>
               
               {/* Action Type */}
               {(formData.type === 'weapon' || formData.type === 'consumable') && (
                 <div>
                   <label className="text-[10px] uppercase font-bold text-yellow-500 mb-1 block flex items-center gap-1"><Clock size={12}/> Custo de Ação</label>
                   <select className="w-full bg-slate-950 border border-yellow-900/30 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none" value={formData.actionType || 'none'} onChange={e => setFormData({...formData, actionType: e.target.value as ActionType})}>
                     {Object.entries(ACTION_TYPES).map(([key, label]) => (<option key={key} value={key} className={optionClass}>{label}</option>))}
                   </select>
                 </div>
               )}

               {formData.type === 'weapon' && (<div><label className="text-[10px] uppercase font-bold text-red-400 mb-1 block">Dano</label><input className="w-full bg-slate-950 border border-red-900/50 rounded p-2 text-sm text-white focus:border-red-500 outline-none" placeholder="Ex: 1d8 + 3" value={formData.damage || ''} onChange={e => setFormData({...formData, damage: e.target.value})} /></div>)}

               {/* GERADOR DE EFEITOS */}
               <div className="bg-slate-950 p-3 rounded border border-slate-700">
                 <label className="text-[10px] uppercase font-bold text-blue-400 mb-2 block flex items-center gap-1"><Sparkles size={12} /> Efeitos</label>
                 
                 <div className="flex flex-wrap gap-2 mb-3">
                    {formData.effects?.map((eff, i) => (
                        <div key={i} className="bg-slate-800 px-2 py-1 rounded text-xs flex items-center gap-2 border border-slate-700">
                            <span className="text-slate-300">
                                {EFFECT_TYPES.find(t => t.value === eff.type)?.label.split(' ')[0]} 
                                {eff.target && ` (${eff.target})`}: 
                                <strong className="text-white ml-1">{eff.value >= 0 ? `+${eff.value}` : eff.value}</strong>
                            </span>
                            <button onClick={() => handleRemoveEffect(i)} className="text-red-400 hover:text-red-200"><X size={12}/></button>
                        </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-12 gap-2 items-end">
                   <div className="col-span-5"><select className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white" value={newEffectType} onChange={e => setNewEffectType(e.target.value as any)}>{EFFECT_TYPES.map(t => <option key={t.value} value={t.value} className={optionClass}>{t.label}</option>)}</select></div>
                   
                   <div className="col-span-4">
                       {renderTargetInput()}
                   </div>
                   
                   <div className="col-span-2"><input type="number" className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white text-center" placeholder="+0" value={newEffectValue} onChange={e => setNewEffectValue(parseInt(e.target.value) || 0)} /></div>
                   <div className="col-span-1"><button onClick={handleAddEffect} className="w-full bg-blue-900 hover:bg-blue-800 text-white p-1.5 rounded flex justify-center"><Plus size={14}/></button></div>
                 </div>
               </div>

               <div><label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Descrição</label><textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none resize-none h-16" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
               <button onClick={handleSaveItem} className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg mt-2">Salvar Item</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}