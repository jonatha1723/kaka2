import React, { useState, useEffect } from 'react';
import { Users, LogOut, Home, Maximize2, Minimize2 } from 'lucide-react';
import PlayTab from './Lobby/PlayTab';
import SocialTab from './Lobby/SocialTab';

interface LobbyProps {
  username: string;
  onPlay: () => void;
  onLogout: () => void;
}

export default function Lobby({ username, onPlay, onLogout }: LobbyProps) {
  const [activeTab, setActiveTab] = useState<'play' | 'social'>('play');
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detecta se é celular/dispositivo móvel de forma robusta
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileSize = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileSize || /android|ipad|iphone|ipod/i.test(userAgent) || isTouchDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Controla o estado de Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.log('Erro ao entrar em tela cheia:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.log('Erro ao sair de tela cheia:', err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row select-none font-sans overflow-hidden">
      
      {/* Side Navigation (Apenas para Tablet e Computador) - md e acima */}
      <div className="hidden md:flex w-64 border-r border-white/5 bg-[#07070a] flex-col pt-8 pb-6 transition-all duration-300">
        <div className="px-6 mb-10">
          <h1 className="font-black tracking-tighter text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">BLOXORBINS</h1>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          <button 
            onClick={() => setActiveTab('play')}
            className={`w-full flex items-center md:space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'play' ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
          >
            <Home size={22} className={activeTab === 'play' ? 'text-white' : 'text-neutral-600'} />
            <span className="font-black text-sm uppercase tracking-tighter">Início</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center md:space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={22} className={activeTab === 'social' ? 'text-white' : 'text-neutral-600'} />
            <span className="font-black text-sm uppercase tracking-tighter">Social</span>
          </button>
        </nav>

        <div className="px-4">
          <div className="p-4 rounded-3xl bg-neutral-900/50 border border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="min-w-9 min-h-9 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-neutral-500 uppercase">{username[0]}</div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Conectado</span>
                <span className="font-bold text-xs truncate max-w-[100px]">{username}</span>
              </div>
            </div>
            <button onClick={onLogout} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-grid-pattern relative flex flex-col pt-6 md:pt-12 pb-24 px-4 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent pointer-events-none" />
        
        {/* Header no Celular (Boas-vindas, Logout e Botão de Fullscreen EXCLUSIVO para mobile) */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-6 bg-neutral-900/50 p-4 rounded-3xl border border-white/5 backdrop-blur-md md:hidden">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="min-w-9 min-h-9 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-neutral-400 uppercase">{username[0]}</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-none">Jogador</span>
              <span className="font-bold text-sm truncate max-w-[110px]">{username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isMobile && (
              <button 
                onClick={toggleFullscreen} 
                className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span>{isFullscreen ? "Sair" : "TELA CHEIA"}</span>
              </button>
            )}
            <button onClick={onLogout} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 transition-all cursor-pointer" title="Sair do Jogo">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {activeTab === 'play' ? <PlayTab onPlay={onPlay} /> : <SocialTab username={username} />}
      </div>

      {/* Bottom Navigation (Apenas para Mobile) - md:hidden */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#07070a]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 pb-2 z-40">
        <button 
          onClick={() => setActiveTab('play')}
          className={`flex flex-col items-center justify-center space-y-1 py-2 px-6 rounded-2xl transition-all duration-300 ${activeTab === 'play' ? 'text-blue-400 scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Home size={22} className={activeTab === 'play' ? 'text-blue-400' : 'text-neutral-500'} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Início</span>
        </button>

        <button 
          onClick={() => setActiveTab('social')}
          className={`flex flex-col items-center justify-center space-y-1 py-2 px-6 rounded-2xl transition-all duration-300 ${activeTab === 'social' ? 'text-blue-400 scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Users size={22} className={activeTab === 'social' ? 'text-blue-400' : 'text-neutral-500'} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Social</span>
        </button>
      </div>

    </div>
  );
}

