import { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit2, Flame, 
  Target, Clock, Scroll, BookOpen, ChevronDown, 
  PlayCircle, RefreshCw, X, Shield
} from 'lucide-react';
import type { CharacterSheet, Spell, Attribute, SpellSlot } from '../../types/dnd';

// Escolas de Magia
const SCHOOLS = [
  'Abjuração', 'Adivinhação', 'Conjuração', 'Encantamento', 
  'Evocação', 'Ilusão', 'Necromancia', 'Transmutação'
];

interface SpellsTabProps {
  character: CharacterSheet;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
  isEditMode: boolean;
}

export function SpellsTab({ character, onUpdate, isEditMode }: SpellsTabProps) {
  
  // Estados de UI
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do Formulário
  const [formData, setFormData] = useState<Spell>({
    id: '', name: '', level: 0, school: 'Evocação', 
    castingTime: '1 ação', range: '18m', components: 'V, S', 
    duration: 'Instantânea', description: '', prepared: true
  });

  // --- CÁLCULOS MÁGICOS ---
  const spellAttrKey = character.spellcastingAttribute || 'intelligence';
  const attrVal = character.attributes[spellAttrKey].value;
  const mod = Math.floor((attrVal - 10) / 2);
  const saveDC = 8 + character.proficiencyBonus + mod;
  const attackBonus = character.proficiencyBonus + mod;
  const attackSign = attackBonus >= 0 ? '+' : '';

  // --- HANDLERS ---

  const handleAttributeChange = (attr: Attribute) => {
    onUpdate({ spellcastingAttribute: attr });
  };

  const handleSlotChange = (level: number, change: number) => {
    const updatedSlots = character.spellSlots.map(slot => {
      if (slot.level === level) {
        const newCurrent = Math.max(0, Math.min(slot.total, slot.current + change));
        return { ...slot, current: newCurrent };
      }
      return slot;
    });
    onUpdate({ spellSlots: updatedSlots });
  };

  const handleMaxSlotChange = (level: number, newTotal: number) => {
    const updatedSlots = character.spellSlots.map(slot => 
      slot.level === level ? { ...slot, total: newTotal, current: Math.min(slot.current, newTotal) } : slot
    );
    onUpdate({ spellSlots: updatedSlots });
  };

  const handleCast = (spell: Spell) => {
    if (spell.level === 0) return; 
    
    const slot = character.spellSlots.find(s => s.level === spell.level);
    if (slot && slot.current > 0) {
      if(confirm(`Conjurar "${spell.name}" gastando 1 slot de nível ${spell.level}?`)) {
        handleSlotChange(spell.level, -1);
      }
    } else {
      alert('Sem slots disponíveis para este nível!');
    }
  };

  const handleRest = () => {
    if(confirm('Recuperar todos os slots de magia?')) {
      const restored = character.spellSlots.map(s => ({ ...s, current: s.total }));
      onUpdate({ spellSlots: restored });
    }
  };

  const handleSaveSpell = () => {
    if (!formData.name) return;
    let newSpells = [...character.spells];
    if (editingId) {
      newSpells = newSpells.map(s => s.id === editingId ? { ...formData, id: editingId } : s);
    } else {
      newSpells.push({ ...formData, id: Date.now().toString() });
    }
    onUpdate({ spells: newSpells });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if(confirm('Apagar magia?')) {
      onUpdate({ spells: character.spells.filter(s => s.id !== id) });
    }
  };

  const startEdit = (spell: Spell) => {
    setFormData(spell);
    setEditingId(spell.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: '', name: '', level: 0, school: 'Evocação', 
      castingTime: '1 ação', range: '18m', components: 'V, S', 
      duration: 'Instantânea', description: '', prepared: true
    });
  };

  // Agrupar magias por nível
  const spellsByLevel: Record<number, Spell[]> = {};
  for(let i = 0; i <= 9; i++) spellsByLevel[i] = [];
  character.spells.forEach(s => {
    if(spellsByLevel[s.level]) spellsByLevel[s.level].push(s);
  });

  return (
    <div className="pb-24 space-y-6">
      
      {/* === Dashboard Limpo === */}
      <div className="bg-slate-900 border border-indigo-900/50 rounded-lg p-3 shadow-lg flex flex-wrap justify-between items-center gap-4">
        
        {/* Bloco de Status */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-950/50 p-2 rounded border border-indigo-500/30 flex flex-col items-center min-w-[50px]">
              <span className="text-xl font-bold text-indigo-300 leading-none">{saveDC}</span>
              <span className="text-[9px] uppercase text-indigo-400 font-bold">CD</span>
            </div>
            <div className="bg-indigo-950/50 p-2 rounded border border-indigo-500/30 flex flex-col items-center min-w-[50px]">
              <span className="text-xl font-bold text-indigo-300 leading-none">{attackSign}{attackBonus}</span>
              <span className="text-[9px] uppercase text-indigo-400 font-bold">ATQ</span>
            </div>
          </div>
        </div>

        {/* Bloco de Configuração */}
        <div className="flex items-center gap-3 ml-auto">
          <select 
            disabled={!isEditMode}
            className={`bg-slate-800 text-xs text-white border border-slate-600 rounded p-1.5 outline-none focus:border-indigo-500 uppercase font-bold tracking-wide ${!isEditMode && 'opacity-70 cursor-default border-transparent'}`}
            value={spellAttrKey}
            onChange={(e) => handleAttributeChange(e.target.value as Attribute)}
          >
            <option value="intelligence">INT (Inteligência)</option>
            <option value="wisdom">SAB (Sabedoria)</option>
            <option value="charisma">CAR (Carisma)</option>
          </select>
          
          <button 
            onClick={handleRest} 
            className="bg-indigo-900/50 hover:bg-indigo-800 p-2 rounded text-indigo-200 border border-indigo-700 transition-colors flex items-center gap-2" 
            title="Recuperar Todos Slots"
          >
            <RefreshCw size={14} />
            <span className="text-xs font-bold hidden sm:inline">Descansar</span>
          </button>
        </div>
      </div>

      {/* === LISTA DE MAGIAS === */}
      <div className="space-y-6">
        
        {/* Nível 0 (Truques) */}
        <SpellLevelSection 
          level={0} 
          spells={spellsByLevel[0]} 
          slots={{ level: 0, current: 0, total: 0 }}
          onCast={handleCast}
          onEdit={startEdit}
          onDelete={handleDelete}
          onAdd={() => { resetForm(); setFormData(p => ({...p, level: 0})); setIsAdding(true); }}
          isEditMode={isEditMode}
          // Truques não precisam de slot handlers
          onSlotUse={() => {}}
          onMaxSlotChange={() => {}}
        />

        {/* Níveis 1 a 9 */}
        {character.spellSlots.map(slot => (
          <SpellLevelSection 
            key={slot.level}
            level={slot.level}
            spells={spellsByLevel[slot.level]}
            slots={slot}
            onCast={handleCast}
            onEdit={startEdit}
            onDelete={handleDelete}
            onAdd={() => { resetForm(); setFormData(p => ({...p, level: slot.level})); setIsAdding(true); }}
            isEditMode={isEditMode}
            onSlotUse={(change: number) => handleSlotChange(slot.level, change)}
            onMaxSlotChange={handleMaxSlotChange}
          />
        ))}

      </div>

      {/* === MODAL ADD/EDIT === */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl p-5 animate-in slide-in-from-bottom-10 fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Sparkles size={18}/> {editingId ? 'Editar Magia' : 'Nova Magia'}
               </h3>
               <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20}/></button>
             </div>

             <div className="space-y-3">
               <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Nome</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Nível</label>
                    <input type="number" max={9} min={0} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm text-center focus:border-indigo-500 outline-none" value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value) || 0})} />
                  </div>
               </div>

               <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Escola</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})}>
                      {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Tempo</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.castingTime} onChange={e => setFormData({...formData, castingTime: e.target.value})} />
                  </div>
               </div>

               <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Alcance</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.range} onChange={e => setFormData({...formData, range: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Duração</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Componentes (V, S, M)</label>
                  <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" value={formData.components} onChange={e => setFormData({...formData, components: e.target.value})} />
               </div>

               <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Descrição</label>
                  <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm h-32 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>

               <button onClick={handleSaveSpell} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded shadow-lg transition-colors">Salvar Magia</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTE: SEÇÃO DE NÍVEL  ---
interface SpellSectionProps {
  level: number;
  spells: Spell[];
  slots: SpellSlot;
  onCast: (s: Spell) => void;
  onEdit: (s: Spell) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isEditMode: boolean;
  onSlotUse: (val: number) => void;
  onMaxSlotChange: (lvl: number, total: number) => void;
}

function SpellLevelSection({ level, spells, slots, onCast, onEdit, onDelete, onAdd, isEditMode, onSlotUse, onMaxSlotChange }: SpellSectionProps) {
  const isCantrip = level === 0;

  // Lógica de Visibilidade:
  // - Truques: Sempre mostra.
  // - Níveis: Mostra se tiver Slots OU se tiver Magias OU se estiver editando.
  if (!isCantrip && slots.total === 0 && spells.length === 0 && !isEditMode) return null;

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden transition-all ${isEditMode && slots.total === 0 && spells.length === 0 ? 'opacity-60 hover:opacity-100' : ''}`}>
      
      <div className="bg-slate-800 px-3 py-2 flex flex-wrap justify-between items-center gap-3 border-b border-slate-700">
        
        {/* Esquerda: Título */}
        <h3 className="font-bold text-indigo-300 uppercase tracking-widest text-sm flex items-center gap-2 min-w-[100px]">
          {isCantrip ? <Sparkles size={16}/> : <Flame size={16}/>}
          {isCantrip ? 'Truques' : `Nível ${level}`}
        </h3>

        {/* Centro: Tracker de Slots (Só para Níveis > 0) */}
        {!isCantrip && (
          <div className="flex items-center gap-3 bg-slate-900/50 rounded px-3 py-1 border border-slate-700/50">
            {/* Controles de Quantidade Total (Só Edit Mode) */}
            {isEditMode && (
              <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-700">
                <button onClick={() => onMaxSlotChange(level, Math.max(0, slots.total - 1))} className="w-5 h-5 flex items-center justify-center text-red-400 hover:bg-slate-700 rounded">-</button>
                <span className="text-xs font-bold text-white w-4 text-center">{slots.total}</span>
                <button onClick={() => onMaxSlotChange(level, slots.total + 1)} className="w-5 h-5 flex items-center justify-center text-green-400 hover:bg-slate-700 rounded">+</button>
              </div>
            )}

            <div className="flex gap-1.5">
              {slots.total === 0 && <span className="text-[10px] text-slate-500 italic">Sem slots</span>}
              {Array.from({ length: slots.total }).map((_, i) => (
                <button
                  key={i}
                  // No modo leitura: clica para gastar/recuperar. No edit: desativado.
                  onClick={() => !isEditMode && onSlotUse(i < slots.current ? -1 : 1)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    i < slots.current 
                    ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]' 
                    : 'bg-slate-900 border-slate-600'
                  } ${isEditMode ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-110 active:scale-90'}`}
                  title={!isEditMode ? "Clique para marcar/desmarcar" : ""}
                />
              ))}
            </div>
          </div>
        )}

        {/* Direita: Botão Add (Só Edit Mode) */}
        {isEditMode ? (
          <button onClick={onAdd} className="text-slate-400 hover:text-white bg-slate-700 p-1.5 rounded transition-colors ml-auto">
            <Plus size={16} />
          </button>
        ) : <div className="ml-auto w-4"></div> /* Espaçador para alinhar se não tiver botão */ }
      </div>

      {/* LISTA DE MAGIAS */}
      <div className="divide-y divide-slate-700/50">
        {spells.length === 0 && (
          <div className="p-4 text-center text-slate-600 text-xs italic">
            {isEditMode ? 'Nenhuma magia. Clique em + para adicionar.' : 'Nenhuma magia aprendida.'}
          </div>
        )}
        
        {spells.map((spell: Spell) => (
          <div key={spell.id} className="group">
            <details className="w-full">
              <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/30 transition-colors list-none">
                <div className="flex items-center gap-3">
                   <span className="text-sm font-bold text-slate-200">{spell.name}</span>
                   {spell.prepared && !isCantrip && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" title="Preparada"></span>}
                   {spell.castingTime.includes('bônus') && <span className="text-[9px] px-1 rounded bg-slate-900 text-yellow-500 border border-yellow-900/30 uppercase font-bold">Bônus</span>}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditMode && (
                    <button 
                      onClick={(e) => { e.preventDefault(); onCast(spell); }}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold border transition-all shadow-sm
                        ${isCantrip 
                          ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' 
                          : (slots.current > 0 ? 'bg-indigo-900/50 text-indigo-200 border-indigo-700 hover:bg-indigo-600 hover:text-white' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50')
                        }`}
                    >
                      <PlayCircle size={14} />
                      {isCantrip ? 'Usar' : 'Conjurar'}
                    </button>
                  )}
                  <ChevronDown size={16} className="text-slate-600 group-open:rotate-180 transition-transform"/>
                </div>
              </summary>
              <div className="px-4 pb-4 pt-0 text-sm text-slate-300 bg-slate-900/30">
                <div className="flex flex-wrap gap-4 mb-3 text-xs text-slate-500 uppercase font-bold border-b border-slate-700/50 pb-2 mt-2">
                  <span className="flex items-center gap-1"><BookOpen size={12}/> {spell.school}</span>
                  <span className="flex items-center gap-1"><Target size={12}/> {spell.range}</span>
                  <span className="flex items-center gap-1"><Scroll size={12}/> {spell.components}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {spell.duration}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-slate-300 opacity-90">{spell.description}</p>
                {isEditMode && (
                  <div className="mt-4 flex justify-end gap-3 pt-3 border-t border-slate-700/30">
                    <button onClick={() => onEdit(spell)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Edit2 size={12}/> Editar</button>
                    <button onClick={() => onDelete(spell.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"><Trash2 size={12}/> Apagar</button>
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}