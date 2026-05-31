/**
 * Global Cheat Engine state for client-side Roblox Spoofing
 */

export interface CheatConfig {
  flyEnabled: boolean;
  noclipEnabled: boolean;
  godModeEnabled: boolean;
  speedMultiplier: number;
  flingActive: boolean;
  kickedPlayers: Record<string, boolean>; // Simulated client-side kicked/banned player IDs
  cheatLog: string[];
}

export const cheatState: CheatConfig = {
  flyEnabled: false,
  noclipEnabled: false,
  godModeEnabled: false,
  speedMultiplier: 1.0,
  flingActive: false,
  kickedPlayers: {},
  cheatLog: [
    "[SYSTEM] BloxSploit v4.5 Iniciado.",
    "[SYSTEM] Aguardando injeção em no processo...",
    "[SYSTEM] Pronto para executar scripts Luau."
  ]
};

// Global helper to add logs
export function addCheatLog(msg: string) {
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatted = `[${time}] ${msg}`;
  cheatState.cheatLog.push(formatted);
  if (cheatState.cheatLog.length > 80) {
    cheatState.cheatLog.shift();
  }
  // Event dispatch to update UI if active
  window.dispatchEvent(new CustomEvent('blox_cheat_log', { detail: formatted }));
}

// Check if player is kicked
export function isPlayerKicked(username: string): boolean {
  return !!cheatState.kickedPlayers[username];
}
