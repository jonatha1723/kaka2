import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

interface BanScreenProps {
  reason: string;
  expiresAt: number;
}

export function BanScreen({ reason, expiresAt }: BanScreenProps) {
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remain = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remain);
      if (remain === 0) {
        window.location.reload(); // Reload to clear ban screen once expired
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-4 font-sans touch-none select-none">
      <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(239,68,68,0.5)] text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          CONTA SUSPENSA
        </h1>

        <p className="text-zinc-400 mb-8 font-medium">
          O sistema anti-trapaça (Vanguard) suspendeu esta sessão devido a
          anomalias.
        </p>

        <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-left">
          <div className="mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-red-400">
              Motivo Detectado
            </span>
            <div className="text-white font-medium mt-1 uppercase text-sm font-mono">
              {reason}
            </div>
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">
              Tempo Restante de Punição
            </span>
            <div className="text-3xl text-white font-mono font-bold mt-1 tracking-wider">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 font-medium">
          Ao final do contador, recarregue a página (F5) para tentar conectar
          novamente.
        </p>
      </div>
    </div>
  );
}
