import React from 'react';
import { Clock } from 'lucide-react';

interface SocialFriendItemProps {
  friend: string;
}

const SocialFriendItem: React.FC<SocialFriendItemProps> = ({ friend }) => {
  return (
    <div className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center justify-between transition-all group">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="relative shrink-0">
          <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-neutral-400 text-base uppercase">
            {friend[0]}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0f] rounded-full" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{friend}</div>
          <div className="text-[9px] text-green-400 font-black uppercase tracking-wider">Online</div>
        </div>
      </div>
      <div className="p-2.5 bg-neutral-900/50 text-neutral-500 rounded-xl">
        <Clock size={16} />
      </div>
    </div>
  );
};

export default SocialFriendItem;
