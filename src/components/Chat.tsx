import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, MessageSquare } from 'lucide-react';

interface ChatProps {
  chats: ChatMessage[];
  onSendMessage: (text: string) => void;
  username: string;
}

export default function Chat({ chats, onSendMessage, username }: ChatProps) {
  const [inputText, setInputText] = useState('');
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to the latest message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText);
    setInputText('');
    inputRef.current?.blur();
    setActive(false);
  };

  // Keyboard shortcut: Press Enter to focus chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
          setActive(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`absolute top-16 left-4 z-40 w-80 flex flex-col rounded-xl border transition-all duration-300 ${
      active 
        ? 'bg-neutral-950/80 border-white/20 shadow-2xl h-60' 
        : 'bg-neutral-950/40 border-white/5 h-40 hover:bg-neutral-950/50'
    }`}>
      {/* Small Chat Title Header */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between text-xs text-neutral-400 font-bold select-none">
        <div className="flex items-center gap-1">
          <MessageSquare size={12} className="text-blue-400" />
          <span>CHAT DO SERVIDOR</span>
        </div>
        <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">Atalho [ENTER]</span>
      </div>

      {/* Messages Box */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-2 select-text" style={{ scrollbarWidth: 'thin' }}>
        {chats.length === 0 ? (
          <div className="text-[11px] text-neutral-500 italic mt-8 text-center select-none">
            Sem conversas no momento. Use Enter para falar!
          </div>
        ) : (
          chats.map(msg => {
            const isSystem = msg.username === '[SISTEMA]' || msg.username === '[GEM]';
            return (
              <div key={msg.id} className="text-xs leading-relaxed break-words animate-fade-in">
                {isSystem ? (
                  <span className="font-bold mr-1.5" style={{ color: msg.color }}>{msg.username}</span>
                ) : (
                  <span 
                    className={`font-semibold mr-1.5 select-all ${msg.username === username ? 'text-blue-300 underline underline-offset-2' : ''}`} 
                    style={{ color: msg.color }}
                  >
                    {msg.username}:
                  </span>
                )}
                <span className={isSystem ? 'italic text-neutral-200' : 'text-neutral-100'}>{msg.text}</span>
                <span className="text-[9px] text-neutral-600 ml-1.5 font-mono select-none">{msg.time}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-white/5 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setActive(true)}
          onBlur={() => setTimeout(() => setActive(false), 150)}
          placeholder="Escreva algo ou aperte Enter..."
          maxLength={80}
          className="flex-1 bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:bg-neutral-900 transition-colors"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <Send size={11} />
        </button>
      </form>
    </div>
  );
}
