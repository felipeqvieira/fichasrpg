import { useState } from 'react';
import { 
  Zap, Star, Plus, Trash2, Edit2, Bookmark, 
  X, Sparkles, Clock, Scroll, User, Crown, Shield 
} from 'lucide-react';
import type { CharacterSheet, Feature, ItemEffect, ActionType } from '../../types/dnd';

// Tipos de Efeitos
const EFFECT_TYPES = [
  { value: 'ac', label: 'Classe de Armadura (CA)' },
  { value: 'attribute', label: 'Atributo' },
  { value: 'save', label: 'Teste de Resistência' },
  { value: 'skill', label: 'Perícia' },
  { value: 'speed', label: 'Movimento' },
  { value: 'damage', label: 'Bônus de Dano' },
  { value: 'other', label: 'Outro' },
];

const ACTION_TYPES: Record<string, string> = {
  'action': 'Ação Padrão',
  'bonus': 'Ação Bônus',
  'reaction': 'Reação',
  'other': 'Outro / Especial',
  'none': 'Nenhum / Passivo'
};

const CATEGORIES = ['Classe', 'Raça', 'Talento', 'Antecedente', 'Outro'];

const MOVEMENT_LIST = ['Caminhada', 'Voo', 'Escalada', 'Natação', 'Escavação'];
const optionClass = "bg-slate-800 text-slate-200";

interface FeaturesTabProps {
  character: CharacterSheet;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
  isEditMode: boolean;
}

export function FeaturesTab({ character, onUpdate, isEditMode }: FeaturesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do Formulário
  const [formData, setFormData] = useState<Feature>({
    id: '', name: '', source: 'Classe', type: 'passive', 
    maxUses: 0, currentUses: 0, recovery: 'long', description: '', effects: [],
    actionType: 'none'
  });

  // Estados de Efeito
  const [newEffectType, setNewEffectType] = useState<ItemEffect['type']>('attribute');
  const [newEffectTarget, setNewEffectTarget] = useState('');
  const [newEffectValue, setNewEffectValue] = useState(0);

  // --- HANDLERS ---
  const handleUseFeature = (feat: Feature) => {
    if (feat.currentUses > 0) {
      const updated = character.features.map(f => f.id === feat.id ? { ...f, currentUses: f.currentUses - 1 } : f);
      onUpdate({ features: updated });
    }
  };

  const handleRecoverFeature = (feat: Feature) => {
    if (feat.currentUses < feat.maxUses) {
      const updated = character.features.map(f => f.id === feat.id ? { ...f, currentUses: f.currentUses + 1 } : f);
      onUpdate({ features: updated });
    }
  };

  const handleSave = () => {
    if (!formData.name) return;
    let newFeatures = [...character.features];
    
    const cleanData = { 
      ...formData, 
      maxUses: formData.type === 'passive' ? 0 : formData.maxUses,
      currentUses: formData.type === 'passive' ? 0 : (editingId ? formData.currentUses : formData.maxUses),
      actionType: formData.type === 'passive' ? 'none' : formData.actionType
    };

    if (editingId) {
      newFeatures = newFeatures.map(f => f.id === editingId ? { ...cleanData, id: editingId } : f);
    } else {
      newFeatures.push({ ...cleanData, id: Date.now().toString() });
    }
    
    onUpdate({ features: newFeatures });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if(confirm('Excluir esta habilidade?')) {
      onUpdate({ features: character.features.filter(f => f.id !== id) });
    }
  };

  const handleAddEffect = () => {
    const effect: ItemEffect = { type: newEffectType, target: newEffectTarget, value: newEffectValue };
    setFormData({ ...formData, effects: [...(formData.effects || []), effect] });
    setNewEffectValue(0);
  };

  const handleRemoveEffect = (idx: number) => {
    setFormData({ ...formData, effects: formData.effects?.filter((_, i) => i !== idx) });
  };

  const startEdit = (feature: Feature) => {
    setFormData({ ...feature, effects: feature.effects || [], actionType: feature.actionType || 'none' });
    setEditingId(feature.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '', name: '', source: 'Classe', type: 'passive', maxUses: 0, currentUses: 0, recovery: 'long', description: '', effects: [], actionType: 'none' });
    setNewEffectType('attribute');
    setNewEffectTarget('');
    setNewEffectValue(0);
  };

  // --- AGRUPAMENTO POR CATEGORIA ---
  const groupedFeatures: Record<string, Feature[]> = {
    'Classe': [], 'Raça': [], 'Talento': [], 'Antecedente': [], 'Outro': []
  };

  character.features.forEach(feat => {
    // Tenta encontrar a categoria exata, senão joga em Outro
    if (groupedFeatures[feat.source]) {
      groupedFeatures[feat.source].push(feat);
    } else {
      groupedFeatures['Outro'].push(feat);
    }
  });

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Classe': return <Shield size={16} className="text-blue-400"/>;
      case 'Raça': return <User size={16} className="text-green-400"/>;
      case 'Talento': return <Star size={16} className="text-yellow-400"/>;
      case 'Antecedente': return <Scroll size={16} className="text-purple-400"/>;
      default: return <Bookmark size={16} className="text-slate-400"/>;
    }
  };

  return (
    <div className="pb-24 space-y-6">
      
      {isEditMode && (
        <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-sm">
          <Plus size={18} /> Adicionar Habilidade / Talento
        </button>
      )}

      {/* LISTA AGRUPADA */}
      <div className="space-y-6">
        {CATEGORIES.map(category => {
          const features = groupedFeatures[category];
          if (features.length === 0 && category !== 'Outro') return null;
          if (category === 'Outro' && features.length === 0) return null;

          return (
            <div key={category} className="animate-in slide-in-from-bottom-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 border-b border-slate-800 pb-1">
                {getCategoryIcon(category)} {category === 'Classe' ? 'Habilidades de Classe' : category === 'Raça' ? 'Traços Raciais' : category === 'Talento' ? 'Talentos' : category}
              </h3>
              
              <div className="space-y-3">
                {features.map(feat => (
                  <div key={feat.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:bg-slate-800/80 transition-colors group relative">
                    
                    <div className="flex justify-between items-start mb-1">
                       <div className="flex items-center gap-2">
                         <h4 className="font-bold text-slate-200 text-sm">{feat.name}</h4>
                         {feat.type === 'active' && (
                           <span className="text-[9px] font-bold text-yellow-500 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-900/40 flex items-center gap-1">
                             <Zap size={8} className="fill-current"/> {feat.maxUses > 0 ? `${feat.currentUses}/${feat.maxUses}` : 'ATIVA'}
                           </span>
                         )}
                       </div>

                       {isEditMode && (
                          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                            <button onClick={() => startEdit(feat)} className="bg-slate-900 p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"><Edit2 size={14}/></button>
                            <button onClick={() => handleDelete(feat.id)} className="bg-slate-900 p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"><Trash2 size={14}/></button>
                          </div>
                        )}
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {feat.type === 'active' && feat.actionType && feat.actionType !== 'none' && (
                        <span className="text-[9px] text-slate-400 uppercase border border-slate-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Clock size={8}/> {ACTION_TYPES[feat.actionType]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line mb-3">{feat.description}</p>
                    
                    {/* VISUALIZAÇÃO DE USOS (MELHORADA) */}
                    {feat.type === 'active' && feat.maxUses > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-700/50">
                        {Array.from({ length: feat.maxUses }).map((_, i) => (
                           <button
                             key={i}
                             // Só permite clicar se tiver usos sobrando OU se estiver no modo edição (para recuperar)
                             onClick={() => { 
                               if (i < feat.currentUses) handleUseFeature(feat); 
                               else if (isEditMode) handleRecoverFeature(feat); 
                             }}
                             disabled={!isEditMode && i >= feat.currentUses}
                             className={`
                               w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-sm
                               ${i < feat.currentUses 
                                 ? 'bg-yellow-500 border-yellow-600 hover:bg-yellow-400' 
                                 : 'bg-slate-900 border-slate-700 opacity-50'
                               }
                               ${(isEditMode || i < feat.currentUses) ? 'cursor-pointer' : 'cursor-not-allowed'}
                             `}
                           >
                             {i < feat.currentUses && <Zap size={12} className="text-black fill-black" />}
                           </button>
                        ))}
                        <span className="text-[9px] text-slate-500 self-center ml-2 uppercase font-bold">
                           Recupera: {feat.recovery === 'short' ? 'Curto' : 'Longo'}
                        </span>
                      </div>
                    )}

                    {/* Efeitos Passivos */}
                    {feat.effects && feat.effects.length > 0 && (
                       <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/50">
                         {feat.effects.map((eff, i) => (
                           <span key={i} className="px-1.5 py-0.5 bg-slate-900/50 border border-slate-700 rounded text-[10px] text-slate-300 font-bold flex items-center gap-1">
                             <Sparkles size={8} />
                             {eff.type === 'speed' ? 'DESL.' : eff.type.toUpperCase()} {eff.target && `(${eff.target})`}: +{eff.value}
                           </span>
                         ))}
                       </div>
                     )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {character.features.length === 0 && !isEditMode && (
          <div className="text-center py-10 text-slate-600 italic text-sm">Nenhuma habilidade registrada.</div>
        )}
      </div>

      {/* MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-5 animate-in slide-in-from-bottom-10 fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Bookmark size={18}/> {editingId ? 'Editar' : 'Nova Habilidade'}</h3><button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20}/></button></div>

             <div className="space-y-4">
               <div><label className="text-[10px] text-slate-500 uppercase font-bold">Nome</label><input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus placeholder="Ex: Fúria, Visão no Escuro" /></div>
               
               <div className="flex gap-3">
                 <div className="flex-1">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Origem (Categoria)</label>
                   {/* SELECT AO INVÉS DE INPUT DE TEXTO */}
                   <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                     {CATEGORIES.map(cat => <option key={cat} value={cat} className={optionClass}>{cat}</option>)}
                   </select>
                 </div>
                 <div className="w-1/3">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Tipo</label>
                   <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                     <option value="passive" className={optionClass}>Passiva (Fixo)</option>
                     <option value="active" className={optionClass}>Ativa (Usos)</option>
                   </select>
                 </div>
               </div>

               {/* SEÇÃO DE AÇÃO (SÓ SE FOR ATIVA) */}
               {formData.type === 'active' && (
                 <div className="bg-yellow-900/10 border border-yellow-900/30 p-2 rounded">
                   <label className="text-[10px] uppercase font-bold text-yellow-500 mb-1 block flex items-center gap-1"><Clock size={12}/> Tipo de Ação</label>
                   <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none" value={formData.actionType || 'none'} onChange={e => setFormData({...formData, actionType: e.target.value as ActionType})}>
                     {Object.entries(ACTION_TYPES).map(([key, label]) => (<option key={key} value={key} className={optionClass}>{label}</option>))}
                   </select>
                   <p className="text-[9px] text-yellow-500/70 mt-1 italic">Define onde aparecerá na aba de Combate.</p>
                 </div>
               )}

               {/* Config de Usos (Só Ativa) */}
               {formData.type === 'active' && (
                 <div className="bg-slate-800/50 p-3 rounded border border-slate-700 animate-in fade-in">
                    <div className="flex gap-3 mb-2">
                      <div className="flex-1"><label className="text-[10px] text-slate-500 uppercase font-bold">Máx Usos</label><input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm text-center" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: parseInt(e.target.value) || 1})} /></div>
                      <div className="flex-1"><label className="text-[10px] text-slate-500 uppercase font-bold">Recuperação</label><select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.recovery} onChange={e => setFormData({...formData, recovery: e.target.value as any})}><option value="short" className={optionClass}>Curto</option><option value="long" className={optionClass}>Longo</option><option value="none" className={optionClass}>Manual</option></select></div>
                    </div>
                 </div>
               )}

               {/* EFEITOS */}
               <div className="bg-slate-950 p-3 rounded border border-slate-700">
                 <label className="text-[10px] uppercase font-bold text-blue-400 mb-2 block flex items-center gap-1"><Sparkles size={12} /> Efeitos / Bônus</label>
                 <div className="flex flex-wrap gap-2 mb-3">{formData.effects?.map((eff, i) => (<div key={i} className="bg-slate-800 px-2 py-1 rounded text-xs flex items-center gap-2 border border-slate-700"><span className="text-slate-300">{EFFECT_TYPES.find(t => t.value === eff.type)?.label} {eff.target && ` (${eff.target})`}: <strong className="text-white ml-1">{eff.value >= 0 ? `+${eff.value}` : eff.value}</strong></span><button onClick={() => handleRemoveEffect(i)} className="text-red-400 hover:text-red-200"><X size={12}/></button></div>))}</div>
                 <div className="grid grid-cols-12 gap-2 items-end">
                   <div className="col-span-5"><select className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white" value={newEffectType} onChange={e => setNewEffectType(e.target.value as any)}>{EFFECT_TYPES.map(t => <option key={t.value} value={t.value} className={optionClass}>{t.label}</option>)}</select></div>
                   <div className="col-span-4">{newEffectType === 'ac' ? (<input disabled className="w-full bg-slate-900/50 text-xs border border-slate-800 rounded p-1.5 text-slate-500 cursor-not-allowed" value="Armadura" />) : (<select className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white" value={newEffectTarget} onChange={e => setNewEffectTarget(e.target.value)}><option value="" className={optionClass}>Alvo...</option>{newEffectType === 'speed' && MOVEMENT_LIST.map(m => <option key={m} value={m} className={optionClass}>{m}</option>)} {(newEffectType !== 'speed') && <option value="Geral" className={optionClass}>Geral</option>}</select>)}</div>
                   <div className="col-span-2"><input type="number" className="w-full bg-slate-900 text-xs border border-slate-700 rounded p-1.5 text-white text-center" placeholder="+0" value={newEffectValue} onChange={e => setNewEffectValue(parseInt(e.target.value) || 0)} /></div>
                   <div className="col-span-1"><button onClick={handleAddEffect} className="w-full bg-blue-900 hover:bg-blue-800 text-white p-1.5 rounded flex justify-center"><Plus size={14}/></button></div>
                 </div>
               </div>

               <div><label className="text-[10px] text-slate-500 uppercase font-bold">Descrição</label><textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
               <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded shadow-lg transition-colors">Salvar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}