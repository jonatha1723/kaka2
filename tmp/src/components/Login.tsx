import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, User, Lock, ShieldCheck, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 dígitos.');
      return;
    }
    
    setLoading(true);
    setError('');

    // Simulate 400ms lag for loading immersion
    setTimeout(() => {
      try {
        const sanitizedUser = username.trim().substring(0, 15);
        if (!sanitizedUser) {
          setError('Nome de usuário inválido.');
          setLoading(false);
          return;
        }

        const accountsRaw = localStorage.getItem('blox_accounts');
        const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};

        if (isRegister) {
          if (accounts[sanitizedUser]) {
            setError('Este nome de usuário já está em uso.');
          } else {
            accounts[sanitizedUser] = password;
            localStorage.setItem('blox_accounts', JSON.stringify(accounts));
            onLogin(sanitizedUser);
          }
        } else {
          if (!accounts[sanitizedUser]) {
            setError('Usuário não encontrado. Cadastre-se primeiro!');
          } else if (accounts[sanitizedUser] !== password) {
            setError('Senha incorreta.');
          } else {
            onLogin(sanitizedUser);
          }
        }
      } catch (err) {
        setError('Erro ao processar login local.');
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white px-4">
      {/* Background Grid & Gradient */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8 space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2 border border-white/10">
            <Play className="text-white fill-white" size={40} />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
            BLOX ORBINS
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                placeholder="Seu nome no jogo"
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Senha Segura</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                placeholder="Mínimo 6 dígitos"
                required 
              />
            </div>
          </div>
          
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              <ShieldCheck size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.button 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative">{loading ? 'CARREGANDO...' : isRegister ? 'CRIAR CONTA' : 'ENTRAR NO JOGO'}</span>
            {!loading && (isRegister ? <UserPlus size={20} className="relative" /> : <Play size={20} className="relative fill-white" />)}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {isRegister ? 'Já possui conta? Fazer Login' : 'Ainda não tem conta? Criar Conta'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
