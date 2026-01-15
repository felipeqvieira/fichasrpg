import { useState, useEffect } from 'react';
import { 
  Book, Plus, Trash2, Calendar, Save, 
  FileText, Search, Download 
} from 'lucide-react';
import type { CharacterSheet, Note } from '../../types/dnd';

interface NotesTabProps {
  character: CharacterSheet;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
  isEditMode: boolean; 
}

export function NotesTab({ character, onUpdate, isEditMode }: NotesTabProps) {
  const notes = character.notes || [];
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes.length]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // --- HANDLERS ---

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `Sessão ${notes.length + 1}`,
      date: new Date().toLocaleDateString('pt-BR'),
      content: ''
    };
    const newNotes = [newNote, ...notes];
    onUpdate({ notes: newNotes });
    setActiveNoteId(newNote.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apagar este registro de sessão?')) {
      const newNotes = notes.filter(n => n.id !== id);
      onUpdate({ notes: newNotes });
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  const handleUpdateActive = (field: keyof Note, value: string) => {
    if (!activeNote) return;
    const newNotes = notes.map(n => 
      n.id === activeNoteId ? { ...n, [field]: value } : n
    );
    onUpdate({ notes: newNotes });
  };

  const handleExport = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 pb-20 md:pb-0">
      
      {/* === LISTA DE SESSÕES === */}
      <div className="w-full md:w-1/3 flex flex-col gap-3 h-1/3 md:h-auto">
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Buscar notas..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Botão ADD escondido no modo leitura */}
          {isEditMode && (
            <button 
              onClick={handleAddNote} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors shadow-lg animate-in fade-in"
              title="Nova Sessão"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg overflow-y-auto no-scrollbar space-y-1 p-1">
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs italic">
              {isEditMode ? "Nenhuma nota. Crie uma!" : "Nenhuma nota encontrada."}
            </div>
          )}
          
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-3 rounded-md transition-all border flex flex-col gap-1 group relative
                ${activeNoteId === note.id 
                  ? 'bg-slate-800 border-indigo-500/50 shadow-md' 
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-700'
                }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-sm font-bold truncate pr-6 ${activeNoteId === note.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {note.title}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar size={10} /> {note.date}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 w-[90%]">
                {note.content || "Sem conteúdo..."}
              </p>

              {/* Botão Deletar só no modo Edição */}
              {isEditMode && (
                <div 
                  onClick={(e) => handleDelete(note.id, e)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-600 hover:text-red-400 hover:bg-slate-900 transition-all ${activeNoteId === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <Trash2 size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* === EDITOR === */}
      <div className="w-full md:w-2/3 flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden relative">
        {activeNote ? (
          <>
            {/* Toolbar do Editor */}
            <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex flex-wrap gap-3 items-center justify-between backdrop-blur-sm">
              <div className="flex-1 min-w-[200px]">
                {/* Título: ReadOnly se !isEditMode */}
                <input 
                  value={activeNote.title}
                  readOnly={!isEditMode}
                  onChange={(e) => handleUpdateActive('title', e.target.value)}
                  className={`bg-transparent text-lg font-bold text-white outline-none w-full placeholder-slate-600 ${!isEditMode && 'cursor-default'}`}
                  placeholder="Título da Sessão..."
                />
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Calendar size={12} />
                  <input 
                    value={activeNote.date}
                    readOnly={!isEditMode}
                    onChange={(e) => handleUpdateActive('date', e.target.value)}
                    className={`bg-transparent outline-none w-24 transition-colors ${isEditMode ? 'hover:text-slate-300' : 'cursor-default'}`}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleExport}
                className="text-slate-500 hover:text-indigo-400 p-2 rounded hover:bg-slate-800 transition-colors"
                title="Baixar Nota (.txt)"
              >
                <Download size={18} />
              </button>
            </div>

            {/* Área de Texto (Papel) */}
            <textarea
              value={activeNote.content}
              readOnly={!isEditMode} 
              onChange={(e) => handleUpdateActive('content', e.target.value)}
              className={`flex-1 w-full bg-slate-800 p-6 text-slate-300 leading-relaxed outline-none resize-none scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent text-sm md:text-base font-mono md:font-sans ${!isEditMode ? 'cursor-text' : ''}`}
              placeholder={isEditMode ? "Escreva os detalhes da sua aventura aqui..." : "Sem anotações para esta sessão."}
              spellCheck={false}
            />
            
            {/* Rodapé status */}
            <div className="bg-slate-900 border-t border-slate-700 px-4 py-1 text-[10px] text-slate-500 flex justify-between">
               <span>{activeNote.content.length} caracteres</span>
               <span className="flex items-center gap-1">
                 {isEditMode ? <><Save size={10}/> Editando</> : <><Book size={10}/> Modo Leitura</>}
               </span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
            <Book size={48} className="opacity-20" />
            <p className="text-sm">Selecione uma sessão ou crie uma nova.</p>
            {isEditMode && (
              <button onClick={handleAddNote} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2">
                <Plus size={16}/> Criar primeira nota
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}