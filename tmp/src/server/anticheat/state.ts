import { PlayerData } from "../../types";

export interface AntiCheatPlayerState {
  lastValidX: number;
  lastValidY: number;
  lastValidZ: number;
  violationCount: number;
  lastPosTime: number;
  airTimeStart: number | null;
}

const acStates: Record<string, AntiCheatPlayerState> = {};

export function getAcState(username: string): AntiCheatPlayerState {
  if (!acStates[username]) {
    acStates[username] = {
      lastValidX: 0,
      lastValidY: 0,
      lastValidZ: 14,
      violationCount: 0,
      lastPosTime: Date.now(),
      airTimeStart: null,
    };
  }
  return acStates[username];
}

export function resetAcState(
  username: string,
  spawnX: number,
  spawnY: number,
  spawnZ: number,
) {
  const state = getAcState(username);
  state.lastValidX = spawnX;
  state.lastValidY = spawnY;
  state.lastValidZ = spawnZ;
}

export function removeAcState(username: string) {
  delete acStates[username];
}
