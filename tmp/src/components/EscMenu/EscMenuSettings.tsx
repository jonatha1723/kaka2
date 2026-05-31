import React, { useState } from 'react';
import { Monitor, Volume2, Minus, Plus } from 'lucide-react';

export default function EscMenuSettings() {
  const [quality, setQuality] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [volume, setVolume] = useState(50);
  const [hideNames, setHideNames] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-neutral-300">
          <Monitor size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Qualidade</span>
        </div>
        <div className="flex bg-[#111115] p-1 rounded-xl border border-white/5">
          {['Baixa', 'Média', 'Alta'].map((m) => (
            <button 
              key={m} 
              onClick={() => setQuality(m as any)} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${quality === m ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-neutral-300">
          <div className="flex items-center space-x-2">
            <Volume2 size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Volume</span>
          </div>
          <span className="text-xs font-bold text-blue-400">{volume}%</span>
        </div>
        <div className="flex items-center space-x-4 bg-[#111115] p-2 rounded-xl border border-white/5">
          <button onClick={() => setVolume(Math.max(0, volume - 10))} className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 text-white text-xs"><Minus size={12} /></button>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${volume}%` }} />
          </div>
          <button onClick={() => setVolume(Math.min(100, volume + 10))} className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 text-white text-xs"><Plus size={12} /></button>
        </div>
      </div>

      <label className="flex items-center justify-between bg-[#111115] p-3 rounded-xl border border-white/5 cursor-pointer">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Esconder Nomes Próprios</span>
        <input
          type="checkbox"
          checked={hideNames}
          onChange={(e) => {
            setHideNames(e.target.checked);
            window.dispatchEvent(new CustomEvent('toggle_nicknames', { detail: e.target.checked }));
          }}
          className="rounded bg-neutral-850 border-white/10 text-blue-600 cursor-pointer"
        />
      </label>
    </div>
  );
}
