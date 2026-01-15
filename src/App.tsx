import React, { useState } from 'react';
import { 
  Shield, Heart, Zap, Backpack, ScrollText, Settings, 
  Edit3, Moon, Tent, BookOpen, Ghost
} from 'lucide-react';
import { useCharacter } from './hooks/useCharacter';
import { StatusTab } from './components/tabs/StatusTab';
import { CombatTab } from './components/tabs/CombatTab';
import { SpellsTab } from './components/tabs/SpellsTab';
import { FeaturesTab } from './components/tabs/FeaturesTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { CreaturesTab } from './components/tabs/CreaturesTab';
import { NotesTab } from './components/tabs/NotesTab';

type Tab = 'status' | 'combat' | 'spells' | 'features' | 'inventory' | 'creatures' | 'notes';

function App() {
  const { character, updateHP, updateCharacter } = useCharacter();
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [isEditMode, setIsEditMode] = useState(false);

  // Cálculos de Porcentagem para a Barra
  const hpPercent = Math.min(100, (character.hp.current / character.hp.max) * 100);
  const tempPercent = Math.min(100, (character.hp.temp / character.hp.max) * 100);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-20">
      
      {/* --- CABEÇALHO GLOBAL (Centralizado) --- */}
      <header className="sticky top-0 z-50 pt-2">
        
        <div className="max-w-4xl mx-auto shadow-xl rounded-b-lg overflow-hidden border-x border-b border-slate-700/50">
          
          {/* Topo: Identidade */}
          <div className="px-4 py-3 bg-red-900/95 text-white flex justify-between items-start backdrop-blur-sm">
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide">{character.name}</h1>
              <p className="text-xs text-red-100 opacity-80 font-mono">
                {character.class} {character.level} | {character.race}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button title="Descanso Curto" className="p-1 hover:bg-red-800 rounded transition-colors text-red-100">
                <Moon size={20} />
              </button>
              <button title="Descanso Longo" className="p-1 hover:bg-red-800 rounded transition-colors text-red-100">
                <Tent size={20} />
              </button>
              
              <div className="w-px h-6 bg-red-700 mx-1 opacity-50"></div>
              
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1 rounded transition-colors ${isEditMode ? 'bg-yellow-500 text-black shadow-lg' : 'hover:bg-red-800 text-red-100'}`}
                title={isEditMode ? "Modo Edição Ativo" : "Ativar Edição"}
              >
                {isEditMode ? <Edit3 size={20} /> : <BookOpen size={20} />}
              </button>
              <button className="p-1 hover:bg-red-800 rounded transition-colors text-red-100">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Barra de Vida Nova */}
          <div className="px-4 py-2 bg-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
              <span>HP: <span className="text-white font-bold">{character.hp.current}</span> <span className="text-slate-500">/ {character.hp.max}</span></span>
              {character.hp.temp > 0 && <span className="text-blue-400 font-bold">Temp: +{character.hp.temp}</span>}
            </div>
            
            {/* Container (Fundo Vermelho Escuro = Dano) */}
            <div className="w-full h-4 bg-red-950/80 rounded-full overflow-hidden border border-red-900/50 flex relative">
              
              {/* Vida Atual (Verde) */}
              <div 
                className="h-full bg-green-600 transition-all duration-500 ease-out" 
                style={{ width: `${hpPercent}%` }}
              ></div>

              {/* Vida Temporária (Azul - Empilhada) */}
              {character.hp.temp > 0 && (
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out opacity-90 border-l border-slate-900/20" 
                  style={{ width: `${tempPercent}%` }}
                ></div>
              )}
            </div>
          </div>

          {/* Navegação de Abas */}
          <nav className="bg-slate-800 flex justify-center overflow-x-auto no-scrollbar border-t border-slate-700">
            <TabButton active={activeTab === 'status'} onClick={() => setActiveTab('status')} icon={<Shield size={18}/>} label="Status" />
            <TabButton active={activeTab === 'combat'} onClick={() => setActiveTab('combat')} icon={<Zap size={18}/>} label="Combate" />
            <TabButton active={activeTab === 'spells'} onClick={() => setActiveTab('spells')} icon={<Ghost size={18}/>} label="Magias" />
            <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon={<Heart size={18}/>} label="Habilid." />
            <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Backpack size={18}/>} label="Inv." />
            <TabButton active={activeTab === 'creatures'} onClick={() => setActiveTab('creatures')} icon={<Settings size={18}/>} label="Criat." />
            <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<ScrollText size={18}/>} label="Notas" />
          </nav>

        </div>
      </header>

      {/* --- CONTEÚDO --- */}
      <main className="p-4 max-w-4xl mx-auto">
        {activeTab === 'status' && (
          <StatusTab 
            character={character} 
            isEditMode={isEditMode} 
            onUpdate={(updates) => updateCharacter(updates)} 
          />
        )}
        
        {activeTab === 'combat' && (
          <CombatTab 
            character={character} 
            onUpdateHP={updateHP} 
            onUpdateCharacter={updateCharacter}
            isEditMode={isEditMode}
          />
        )}
        
        {activeTab === 'spells' && (
          <SpellsTab 
            character={character} 
            onUpdate={updateCharacter}
            isEditMode={isEditMode} 
          />
        )}

        {activeTab === 'features' && (
          <FeaturesTab 
            character={character} 
            onUpdate={updateCharacter} 
            isEditMode={isEditMode}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab 
            character={character} 
            isEditMode={isEditMode} 
            onUpdate={updateCharacter} 
          />
        )}

        {activeTab === 'creatures' && (
          <CreaturesTab 
            character={character} 
            onUpdate={updateCharacter} 
            isEditMode={isEditMode}   
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab 
            character={character} 
            onUpdate={updateCharacter}
            isEditMode={isEditMode}
          />
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2
        ${active 
          ? 'border-red-500 text-red-400 bg-slate-700/50' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;