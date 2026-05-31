import React from 'react';
import { motion } from 'motion/react';
import { Play, Map } from 'lucide-react';

interface PlayTabProps {
  onPlay: () => void;
}

export default function PlayTab({ onPlay }: PlayTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-black mb-8">Escolha sua Experiência</h2>
      
      <div className="bg-neutral-900/40 backdrop-blur-md p-6 rounded-3xl group relative overflow-hidden transition-all hover:ring-2 hover:ring-blue-500/50 border border-white/5 shadow-2xl">
        {/* Map Preview Graphic */}
        <div className="w-full h-64 bg-black/60 rounded-2xl mb-6 relative overflow-hidden border border-white/5 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40" />
          <Map size={60} className="text-white/20" />
          <div className="absolute bottom-4 left-4 right-4 h-1/3 bg-gradient-to-t from-green-900/30 to-transparent rounded-lg blur-md" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px]" />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded tracking-tighter uppercase">Original</span>
              <span className="text-green-400 text-xs font-bold uppercase tracking-widest">• 1.2k Jogando</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight">Blox Orbins: The Cloud Castle</h3>
            <p className="text-neutral-400 max-w-md text-sm leading-relaxed">Escale a torre dos céus, desvie de lavas voadoras e corra no modo speedrun. Apenas UM mapa está ativo no momento.</p>
          </div>
          <button 
            onClick={onPlay}
            className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-black font-black px-10 py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95 shadow-[0_4px_30px_rgba(34,197,94,0.3)] cursor-pointer group-hover:px-12"
          >
            <Play className="fill-black" size={20} />
            <span className="tracking-tight">JOGAR AGORA</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
