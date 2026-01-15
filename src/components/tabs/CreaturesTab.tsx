import { useState } from 'react';
import { 
  PawPrint, Shield, Heart, Zap, Plus, X, 
  Trash2, Edit2, Sword, Skull, Activity, Dna 
} from 'lucide-react';
import type { CharacterSheet, Creature, CreatureAttack } from '../../types/dnd';

interface CreaturesTabProps {
  character: CharacterSheet;
  onUpdate?: (updates: Partial<CharacterSheet>) => void;
  isEditMode: boolean;
}

// Função auxiliar para calcular modificador
const getMod = (val: number) => Math.floor((val - 10) / 2);
const formatMod = (val: number) => {
  const mod = getMod(val);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export function CreaturesTab({ character, onUpdate, isEditMode }: CreaturesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado para guardar os inputs de HP de CADA criatura individualmente
  const [hpInputs, setHpInputs] = useState<Record<string, string>>({});

  // Estado do Formulário
  const [formData, setFormData] = useState<Creature>({
    id: '', name: '', type: 'Besta', hp: { current: 10, max: 10 }, ac: 10, speed: '9m',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    attacks: [], notes: ''
  });

  const [newAttack, setNewAttack] = useState<CreatureAttack>({ name: '', bonus: '', damage: '', type: '' });

  // --- HANDLERS DE HP ---

  const handleInputChange = (id: string, value: string) => {
    setHpInputs(prev => ({ ...prev, [id]: value }));
  };

  const applyHP = (creatureId: string, type: 'heal' | 'damage') => {
    if (!onUpdate) return;
    
    const amount = parseInt(hpInputs[creatureId] || '0');
    if (!amount || amount <= 0) return;

    const change = type === 'heal' ? amount : -amount;

    const updatedCreatures = character.creatures.map(c => {
      if (c.id === creatureId) {
        const newCurrent = Math.max(0, Math.min(c.hp.max, c.hp.current + change));
        return { ...c, hp: { ...c.hp, current: newCurrent } };
      }
      return c;
    });

    onUpdate({ creatures: updatedCreatures });
    setHpInputs(prev => ({ ...prev, [creatureId]: '' }));
  };

  // --- OUTROS HANDLERS ---

  const handleDelete = (id: string) => {
    if (!onUpdate) return;
    if (confirm('Remover esta criatura?')) {
      onUpdate({ creatures: character.creatures.filter(c => c.id !== id) });
    }
  };

  const handleSave = () => {
    if (!onUpdate || !formData.name) return;
    let newCreatures = [...character.creatures];
    if (editingId) {
      newCreatures = newCreatures.map(c => c.id === editingId ? { ...formData, id: editingId } : c);
    } else {
      newCreatures.push({ ...formData, id: Date.now().toString() });
    }
    onUpdate({ creatures: newCreatures });
    resetForm();
  };

  const startEdit = (c: Creature) => {
    setFormData(c);
    setEditingId(c.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: '', name: '', type: 'Besta', hp: { current: 10, max: 10 }, ac: 10, speed: '9m',
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      attacks: [], notes: ''
    });
    setNewAttack({ name: '', bonus: '', damage: '', type: '' });
  };

  const addAttack = () => {
    if (newAttack.name) {
      setFormData({ ...formData, attacks: [...formData.attacks, newAttack] });
      setNewAttack({ name: '', bonus: '', damage: '', type: '' });
    }
  };
  const removeAttack = (idx: number) => {
    setFormData({ ...formData, attacks: formData.attacks.filter((_, i) => i !== idx) });
  };

  return (
    <div className="pb-24 space-y-6">
      
      {isEditMode && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-sm animate-in fade-in"
        >
          <Plus size={18} /> Adicionar Criatura
        </button>
      )}

      {/* Lista de Criaturas */}
      <div className="space-y-4">
        {character.creatures.map(c => (
          <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg transition-all">
            
            {/* Cabeçalho */}
            <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className="bg-slate-800 p-2 rounded-full border border-slate-700 text-slate-400">
                   <PawPrint size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-200 text-lg leading-none">{c.name}</h3>
                   <span className="text-xs text-slate-500 uppercase font-bold">{c.type}</span>
                 </div>
              </div>
              {isEditMode && (
                <div className="flex gap-1">
                  <button onClick={() => startEdit(c)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"><Trash2 size={16}/></button>
                </div>
              )}
            </div>

            {/* Status Principais */}
            <div className="grid grid-cols-3 gap-px bg-slate-700/50 border-b border-slate-700">
               <div className="bg-slate-800 p-2 flex flex-col items-center justify-center relative group">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1"><Shield size={10}/> CA</div>
                  <span className="text-xl font-bold text-white">{c.ac}</span>
               </div>
               <div className="bg-slate-800 p-2 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1"><Activity size={10}/> Desl</div>
                  <span className="text-sm font-bold text-white">{c.speed}</span>
               </div>
               <div className="bg-slate-800 p-2 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1"><Dna size={10}/> Passiva</div>
                  <span className="text-sm font-bold text-white">{10 + getMod(c.stats.wis)}</span>
               </div>
            </div>

            {/* CONTROLE DE HP */}
            <div className="p-3 bg-slate-800 border-b border-slate-700">
               <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-400 uppercase">
                 <span>Pontos de Vida</span>
                 <span className={c.hp.current < c.hp.max / 2 ? "text-red-400" : "text-slate-300"}>{c.hp.current} / {c.hp.max}</span>
               </div>
               <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 mb-2">
                 <div className={`h-full transition-all ${c.hp.current < c.hp.max * 0.3 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${Math.min(100, (c.hp.current / c.hp.max) * 100)}%` }}></div>
               </div>
               
               <div className="flex gap-2">
                 <input 
                   type="number" 
                   placeholder="Qtd" 
                   className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-center text-white outline-none focus:border-indigo-500 font-bold placeholder-slate-600" 
                   value={hpInputs[c.id] || ''} 
                   onChange={(e) => handleInputChange(c.id, e.target.value)}
                 />
                 <button onClick={() => applyHP(c.id, 'damage')} className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/40 rounded py-1 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                   <Sword size={14}/> DANO
                 </button>
                 <button onClick={() => applyHP(c.id, 'heal')} className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-200 border border-green-900/40 rounded py-1 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                   <Heart size={14}/> CURA
                 </button>
               </div>
            </div>

            {/* ATRIBUTOS (FONTE AUMENTADA AQUI) */}
            <div className="grid grid-cols-6 text-center py-3 bg-slate-900/30 border-b border-slate-700">
               {Object.entries(c.stats).map(([key, val]) => (
                 <div key={key}>
                   <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">{key}</div>
                   <div className="text-sm font-bold text-slate-200">{val} <span className="text-xs text-slate-500 font-normal">({formatMod(val)})</span></div>
                 </div>
               ))}
            </div>

            {/* Ataques e Notas */}
            <div className="p-3 space-y-3">
               {c.attacks.length > 0 && (
                 <div className="space-y-2">
                   {c.attacks.map((atk, idx) => (
                     <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
                        <div className="flex items-center gap-2">
                           <Sword size={14} className="text-slate-500"/>
                           <span className="text-sm font-bold text-slate-200">{atk.name}</span>
                        </div>
                        <div className="text-right text-xs">
                           <div className="font-bold text-slate-300">{atk.bonus}</div>
                           <div className="text-slate-500">{atk.damage} {atk.type && `(${atk.type})`}</div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
               {c.notes && (
                 <div className="text-xs text-slate-400 italic bg-slate-900/30 p-2 rounded border border-slate-700/30">
                   {c.notes}
                 </div>
               )}
            </div>
          </div>
        ))}

        {character.creatures.length === 0 && !isEditMode && (
          <div className="text-center py-10 text-slate-600 italic text-sm">Nenhuma criatura adicionada. Ative o modo edição para criar.</div>
        )}
      </div>

      {/* MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-5 animate-in slide-in-from-bottom-10 fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
             
             <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <PawPrint size={18}/> {editingId ? 'Editar Criatura' : 'Nova Criatura'}
               </h3>
               <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20}/></button>
             </div>

             <div className="space-y-4">
               {/* Formulário básico */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2 sm:col-span-1">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Nome</label>
                   <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus placeholder="Lobo, Familiar..." />
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Tipo</label>
                   <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-indigo-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Besta, Fada..." />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">HP Máximo</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm text-center outline-none focus:border-red-500" value={formData.hp.max} onChange={e => setFormData({...formData, hp: { ...formData.hp, max: parseInt(e.target.value)||1, current: parseInt(e.target.value)||1 }})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">CA</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm text-center outline-none focus:border-blue-500" value={formData.ac} onChange={e => setFormData({...formData, ac: parseInt(e.target.value)||10})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Deslocamento</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm text-center outline-none focus:border-green-500" value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} />
                  </div>
               </div>

               {/* ATRIBUTOS (INPUTS AUMENTADOS NO MODAL TAMBÉM) */}
               <div className="bg-slate-950 p-3 rounded border border-slate-700">
                 <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2 text-center">Atributos</label>
                 <div className="grid grid-cols-6 gap-2">
                   {['str','dex','con','int','wis','cha'].map(attr => (
                     <div key={attr} className="flex flex-col items-center">
                       <label className="text-[9px] text-slate-500 uppercase font-bold mb-1">{attr}</label>
                       <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm text-center outline-none focus:border-indigo-500" value={(formData.stats as any)[attr]} onChange={e => setFormData({...formData, stats: { ...formData.stats, [attr]: parseInt(e.target.value)||10 }})} />
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-slate-950 p-3 rounded border border-slate-700">
                 <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2 flex items-center gap-1"><Sword size={12}/> Ataques</label>
                 <div className="space-y-2 mb-3">
                   {formData.attacks.map((atk, i) => (
                     <div key={i} className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        <span className="text-xs text-slate-300"><strong>{atk.name}</strong> ({atk.bonus}) - {atk.damage}</span>
                        <button onClick={() => removeAttack(i)} className="text-slate-600 hover:text-red-400"><X size={12}/></button>
                     </div>
                   ))}
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    <input placeholder="Nome" className="col-span-4 sm:col-span-2 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white outline-none" value={newAttack.name} onChange={e => setNewAttack({...newAttack, name: e.target.value})} />
                    <input placeholder="+Atq" className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white outline-none" value={newAttack.bonus} onChange={e => setNewAttack({...newAttack, bonus: e.target.value})} />
                    <input placeholder="Dano" className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white outline-none" value={newAttack.damage} onChange={e => setNewAttack({...newAttack, damage: e.target.value})} />
                    <button onClick={addAttack} className="col-span-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded p-1.5 text-xs font-bold">+ Adicionar Ataque</button>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] text-slate-500 uppercase font-bold">Traços e Notas</label>
                 <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm h-20 resize-none outline-none focus:border-indigo-500" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ex: Vantagem em testes de percepção (faro)..." />
               </div>

               <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded shadow-lg transition-colors">Salvar Criatura</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}