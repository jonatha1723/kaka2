import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search } from 'lucide-react';
import SocialFriendItem from './SocialFriendItem';
import SocialRequests from './SocialRequests';
import SocialAddFriend from './SocialAddFriend';

interface SocialTabProps {
  username: string;
}

export default function SocialTab({ username }: SocialTabProps) {
  const [friends, setFriends] = useState<string[]>([]);
  const [requests, setRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para feedback visual elegante sem usar alert()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/social/${username}`);
      const data = await res.json();
      setFriends(data.friends || []);
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Erro ao sincronizar dados sociais:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualiza a cada 5 segundos para simular pedidos e conexões 100% reais em tempo real
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [username]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const acceptRequest = async (requester: string) => {
    try {
      await fetch('/api/social/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accepter: username, requester })
      });
      showFeedback('success', `Você e ${requester} agora são amigos!`);
      fetchData();
    } catch (err) {
      showFeedback('error', 'Ops, erro ao aceitar pedido.');
    }
  };

  const declineRequest = async (requester: string) => {
    try {
      await fetch('/api/social/decline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decliner: username, requester })
      });
      showFeedback('success', `Pedido de ${requester} recusado.`);
      fetchData();
    } catch (err) {
      showFeedback('error', 'Erro ao recusar pedido.');
    }
  };

  const sendRequest = async (target: string) => {
    if (target.toLowerCase() === username.toLowerCase()) {
      showFeedback('error', 'Você não pode enviar pedido para você mesmo!');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/social/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: username, to: target })
      });
      const data = await response.json();
      if (data.success) {
        showFeedback('success', `Pedido enviado para ${target}!`);
      } else {
        showFeedback('error', 'Erro ao enviar pedido de amizade.');
      }
    } catch (err) {
      showFeedback('error', 'Erro na conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative z-10 max-w-4xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Toast Feedback Animado */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl border font-bold text-sm tracking-tight flex items-center space-x-3 text-white ${
              feedback.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500/20 shadow-emerald-500/10' 
                : 'bg-red-600 border-red-500/20 shadow-red-500/10'
            }`}
          >
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black flex items-center space-x-3">
          <Users className="text-blue-400 shrink-0" size={30} />
          <span>Rede Social</span>
        </h2>
        <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 self-start sm:self-center">
          {friends.length} {friends.length === 1 ? 'Amigo' : 'Amigos'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Friends List */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text"
              placeholder="Procurar entre seus amigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Amigos Correntes</h3>
            
            {friends.length === 0 ? (
              <div className="bg-black/20 border border-dashed border-white/5 p-8 text-center rounded-2xl text-stone-500 font-medium">
                Sua lista de amigos está vazia. Envie um pedido ao lado para começar!
              </div>
            ) : (
              <div className="space-y-2 col-span-1">
                {friends.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase())).map((friend) => (
                  <SocialFriendItem key={friend} friend={friend} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Requests & Sending */}
        <div className="space-y-6">
          <SocialAddFriend 
            isSubmitting={isSubmitting} 
            onSendRequest={sendRequest} 
          />

          <SocialRequests 
            requests={requests} 
            onAccept={acceptRequest} 
            onDecline={declineRequest} 
          />
        </div>
      </div>
    </motion.div>
  );
}
