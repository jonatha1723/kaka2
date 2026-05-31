import React, { useEffect, useRef } from "react";
import Controls from "./Controls";
import Chat from "./Chat";
import EscMenu from "./EscMenu";
import PlayerLabels from "./PlayerLabels";
import { BanScreen } from "./BanScreen";
import { useGameEngine } from "../hooks/useGameEngine";
import { useGameInput } from "../hooks/useGameInput";
import { useOrbitCamera } from "../hooks/useOrbitCamera";
import { useGameRenderer } from "../hooks/useGameRenderer";

interface GameCanvasProps {
  username: string;
  onLogout: () => void;
}

export default function GameCanvas({ username, onLogout }: GameCanvasProps) {
  const [showEscMenu, setShowEscMenu] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const { players, orbs, loading, disconnected, alerts, chats, banInfo, sendInput, sendChatMessage, reconnect, updateLocalPlayerPosition } = useGameEngine(username);
  const { cameraRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel } = useOrbitCamera();
  const { keysRef, analogInputRef, syncInputsWithServer } = useGameInput(sendInput, cameraRef);
  const syncRef = useRef(syncInputsWithServer);
  useEffect(() => { syncRef.current = syncInputsWithServer; }, [syncInputsWithServer]);

  useEffect(() => {
    const hDown = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); setShowEscMenu(v => !v); return; } if (document.activeElement?.tagName === "INPUT") return; const k = e.key.toLowerCase(); if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault(); if (!keysRef.current[k]) { keysRef.current[k] = true; if (k === " " || e.code === "Space") { analogInputRef.current.jump = true; syncRef.current(true); setTimeout(() => { analogInputRef.current.jump = false; syncRef.current(true); }, 100); } else syncRef.current(true); } };
    const hUp = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (keysRef.current[k]) { keysRef.current[k] = false; syncRef.current(true); } };
    window.addEventListener("keydown", hDown); window.addEventListener("keyup", hUp);
    return () => { window.removeEventListener("keydown", hDown); window.removeEventListener("keyup", hUp); };
  }, [keysRef, analogInputRef]);

  useEffect(() => {
    if (loading || disconnected) return;
    const t = setInterval(() => { const a = Object.values(keysRef.current).some(k => k) || analogInputRef.current.dx !== 0 || analogInputRef.current.dy !== 0 || analogInputRef.current.jump; syncRef.current(a); }, 40);
    return () => clearInterval(t);
  }, [loading, disconnected, keysRef, analogInputRef]);

  const pRef = useRef(players), oRef = useRef(orbs), uRef = useRef(username);
  useEffect(() => { pRef.current = players; oRef.current = orbs; uRef.current = username; }, [players, orbs, username]);

  useGameRenderer(loading, disconnected, containerRef, canvasRef, labelContainerRef, pRef, oRef, uRef, cameraRef, keysRef, analogInputRef, updateLocalPlayerPosition);

  if (banInfo) return <BanScreen reason={banInfo.reason} expiresAt={banInfo.expiresAt} />;
  if (disconnected) return (
    <div className="min-h-screen bg-[#07060e] flex flex-col items-center justify-center text-white p-8">
      <div className="bg-black border border-red-500/20 p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-black text-red-500 mb-4 tracking-tighter">CONEXÃO PERDIDA</h2>
        <button onClick={reconnect} className="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-3 rounded-xl mb-3 w-full transition-colors">TENTAR NOVAMENTE</button>
        <button onClick={onLogout} className="text-neutral-500 hover:text-neutral-300 w-full text-xs font-bold uppercase tracking-wider">Voltar ao Login</button>
      </div>
    </div>
  );
  if (loading) return <div className="min-h-screen bg-[#07060e] flex items-center justify-center text-white font-black tracking-widest text-sm anim-pulse">CARREGANDO...</div>;

  const hasDeath = alerts.some((a) => a.type === "death");
  const hasWin = alerts.some((a) => a.type === "win");
  const hasCorrection = alerts.some((a) => a.type === "correction");

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black touch-none">
      <canvas ref={canvasRef} onPointerDown={e => handlePointerDown(e, canvasRef.current)} onPointerMove={handlePointerMove} onPointerUp={e => handlePointerUp(e, canvasRef.current)} onPointerCancel={e => handlePointerUp(e, canvasRef.current)} onWheel={handleWheel} className="block w-full h-full cursor-grab active:cursor-grabbing" />
      <PlayerLabels ref={labelContainerRef} />
      <button onClick={() => setShowEscMenu(true)} className="absolute top-4 left-4 z-50 w-9 h-9 bg-neutral-950/80 border border-white/20 hover:border-white/40 active:scale-95 rounded-lg flex items-center justify-center transition-all">
        <div className="w-5 h-5 bg-neutral-200 rounded-sm rotate-6 font-black text-black text-[11px] flex items-center justify-center">R</div>
      </button>
      <Chat chats={chats} onSendMessage={sendChatMessage} username={username} />
      <Controls onInput={sendInput} onActiveInput={analogInputRef} />
      <EscMenu isOpen={showEscMenu} onClose={() => setShowEscMenu(false)} onLogout={onLogout} players={players} username={username} />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-4 w-full max-w-lg">
        {hasCorrection && <div className="bg-blue-600/90 border border-blue-400 p-4 rounded-xl text-white font-bold text-center animate-bounce">⚠️ POSIÇÃO CORRIGIDA</div>}
        {hasDeath && <div className="bg-red-600/90 border border-red-400 p-4 rounded-xl text-white font-bold text-center animate-shake">💀 VOCÊ MORREU</div>}
        {hasWin && <div className="bg-yellow-500/95 border border-white p-4 rounded-xl text-black font-black text-center animate-bounce shadow-2xl">🎉 VITÓRIA! (+100)</div>}
      </div>
    </div>
  );
}


