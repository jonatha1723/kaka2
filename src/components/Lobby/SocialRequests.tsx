import React from 'react';
import { UserPlus, Check, X } from 'lucide-react';

interface SocialRequestsProps {
  requests: string[];
  onAccept: (requester: string) => void;
  onDecline: (requester: string) => void;
}

const SocialRequests: React.FC<SocialRequestsProps> = ({ requests, onAccept, onDecline }) => {
  return (
    <div className="bg-blue-600/[0.04] border border-blue-500/10 p-5 rounded-3xl space-y-4">
      <h3 className="text-xs font-black text-blue-400 flex items-center space-x-2 uppercase tracking-wider">
        <UserPlus size={15} />
        <span>Solicitações Pendentes</span>
      </h3>
      {requests.length === 0 ? (
        <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-tight text-center py-4 bg-black/15 rounded-2xl">
          Sem solicitações
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {requests.map((req) => (
            <div key={req} className="bg-black/30 p-3 rounded-2xl flex items-center justify-between border border-white/5">
              <span className="font-bold text-xs truncate max-w-[110px] text-neutral-200">{req}</span>
              <div className="flex space-x-1.5 shrink-0">
                <button 
                  onClick={() => onAccept(req)} 
                  className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  title="Aceitar Pedido"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => onDecline(req)}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
                  title="Recusar Pedido"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialRequests;
