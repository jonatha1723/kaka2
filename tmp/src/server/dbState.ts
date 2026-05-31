import { PlayerData, OrbData } from '../types';
import { ORBS_PRESETS } from '../world';

export interface GlobalChat {
  id: string;
  username: string;
  text: string;
  time: string;
  color: string;
}

// In-memory server state databases
export const activePlayers: Record<string, PlayerData & { lastSeen: number }> = {};
export const socialData: Record<string, { friends: string[]; requests: string[] }> = {};
export const globalChats: GlobalChat[] = [];

// Orbs states initialization
export let activeOrbs: OrbData[] = ORBS_PRESETS.map((orb) => ({
  id: orb.id,
  x: orb.x * 40,
  y: orb.y * 40,
  z: orb.z,
  color: orb.color,
  points: orb.points,
}));

// Track collected orbs on server to allow safe timed respawns
export const collectedOrbsState: Record<string, boolean> = {};

// Adds a chat message safely and returns the created message
export function addGlobalChat(username: string, text: string, color: string = '#ffffff'): GlobalChat {
  const chat = {
    id: String(Date.now() + Math.random()),
    username,
    text,
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    color,
  };
  globalChats.push(chat);
  if (globalChats.length > 50) {
    globalChats.shift();
  }
  return chat;
}
