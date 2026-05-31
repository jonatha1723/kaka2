import React from 'react';
import { PlayerData } from '../../types';

interface EscMenuPlayersProps {
  players: Record<string, PlayerData>;
  username: string;
}

export default function EscMenuPlayers({ players, username }: EscMenuPlayersProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Jogadores Ativos</h3>
      <div className="space-y-1.5">
        {Object.values(players).map((p) => (
          <div key={p.username} className={`p-3 rounded-xl border flex items-center justify-between ${
            p.username === username ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#15151a] border-white/5'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-neutral-800 rounded-lg flex items-center justify-center font-bold text-neutral-300 text-xs uppercase">
                {p.username[0]}
              </div>
              <span className="font-bold text-xs text-white">
                {p.username} {p.username === username && <span className="text-blue-400 ml-1">(Você)</span>}
              </span>
            </div>
            <span className="text-[10px] font-black text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
              ★ {p.score || 0} Orbs
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
