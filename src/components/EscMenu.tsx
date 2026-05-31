import React, { useState } from 'react';
import { PlayerData } from '../types';
import { X, Users, Settings, LogOut, Play } from 'lucide-react';
import EscMenuPlayers from './EscMenu/EscMenuPlayers';
import EscMenuSettings from './EscMenu/EscMenuSettings';

interface EscMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  players: Record<string, PlayerData>;
  username: string;
}

export default function EscMenu({ isOpen, onClose, onLogout, players, username }: EscMenuProps) {
  const [activeTab, setActiveTab] = useState<'players' | 'settings'>('players');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000a0] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#1e1e24] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="bg-[#111115] px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center rounded-lg rotate-6 select-none font-black text-black text-[16px]">R</div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Menu do Jogo</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={18} /></button>
        </div>

        <div className="flex bg-[#16161c] border-b border-white/5 p-1">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center space-x-2 transition-all ${activeTab === 'players' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-500' : 'text-neutral-400 hover:text-white'}`}
          >
            <Users size={14} />
            <span>Pessoas ({Object.keys(players).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center space-x-2 transition-all ${activeTab === 'settings' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-500' : 'text-neutral-400 hover:text-white'}`}
          >
            <Settings size={14} />
            <span>Configurações</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'players' ? (
            <EscMenuPlayers players={players} username={username} />
          ) : (
            <EscMenuSettings />
          )}
        </div>

        <div className="bg-[#111115] p-4 border-t border-white/10 flex gap-2">
          <button onClick={onClose} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer">
            <Play size={14} className="fill-white" />
            <span>Retomar</span>
          </button>
          <button onClick={onLogout} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer">
            <LogOut size={14} />
            <span>Sair do Jogo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

