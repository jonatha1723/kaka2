export interface PlayerData {
  id: string; // The username is the ID here for simplicity
  username: string;
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  color: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  time: string;
  color: string;
}

export interface OrbData {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  points: number;
}

export type WSMessage =
  | { type: 'join'; username: string; color?: string }
  | { type: 'input'; dx: number; dy: number; jump: boolean }
  | { type: 'pos'; x: number; y: number; z: number; dx: number; dy: number; dz: number; score: number }
  | { type: 'chat'; username: string; text: string; color?: string }
  | { type: 'state'; players: Record<string, PlayerData>; orbs: OrbData[] }
  | { type: 'correction'; pos: { x: number; y: number; z: number } }
  | { type: 'banned'; reason: string; expiresAt: number }
  | { type: 'died' }
  | { type: 'win' }
  | { type: 'orb_collected'; orbId: string; username: string; score: number }
  | { type: 'system_msg'; text: string };
