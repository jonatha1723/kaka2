import React, { useState } from 'react';

interface SocialAddFriendProps {
  isSubmitting: boolean;
  onSendRequest: (target: string) => Promise<void>;
}

const SocialAddFriend: React.FC<SocialAddFriendProps> = ({ isSubmitting, onSendRequest }) => {
  const [addUsername, setAddUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = addUsername.trim();
    if (!target) return;
    await onSendRequest(target);
    setAddUsername('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] p-5 rounded-3xl border border-white/5 space-y-3">
      <div>
        <h3 className="text-xs font-black text-white uppercase tracking-tight mb-1">Adicionar Amigo</h3>
        <p className="text-[10px] text-neutral-500 font-medium">Insira o apelido exato do jogador para fazer a conexão.</p>
      </div>
      <input 
        type="text"
        placeholder="Ex: PlayerMaster"
        value={addUsername}
        onChange={(e) => setAddUsername(e.target.value)}
        disabled={isSubmitting}
        className="w-full bg-black/50 border border-white/5 rounded-2xl p-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 p-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white transition-all cursor-pointer shadow-[0_4px_15px_rgba(59,130,246,0.15)]"
      >
        {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
      </button>
    </form>
  );
};

export default SocialAddFriend;
