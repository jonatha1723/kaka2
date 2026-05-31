import { PlayerData } from "../../types";
import { validateMovement } from "./movement";
import { validateFlight } from "./flight";
import { checkGodModeViolation } from "./environment";
import { getAcState, removeAcState, resetAcState } from "./state";
import { getSpawnParams } from "../../constants";

// Response from anti-cheat system
export interface AcResult {
  valid: boolean;
  forceKill?: boolean;
  correctionPos?: { x: number; y: number; z: number };
  ban?: { reason: string; durationMs: number };
}

export function verifyPlayerPosition(
  username: string,
  currentPos: { x: number; y: number; z: number },
  newPos: {
    x: number;
    y: number;
    z: number;
    dx: number;
    dy: number;
    dz: number;
  },
): AcResult {
  const result: AcResult = { valid: true };
  const acState = getAcState(username);

  // 1. Validate God Mode / Environmental Deaths
  if (checkGodModeViolation(newPos.x, newPos.y, newPos.z)) {
    result.valid = false;
    result.forceKill = true; // They are in a death zone but sent a normal update
    return result;
  }

  // 2. Validate Flight (FlyHack)
  const flightResult = validateFlight(acState, newPos);
  if (!flightResult.valid) {
    acState.violationCount++;
    result.valid = false;
    if (flightResult.banReason && flightResult.durationMs) {
      result.ban = {
        reason: flightResult.banReason,
        durationMs: flightResult.durationMs,
      };
    } else {
      // Rubberband back to last valid coordinate instead of aggressive teleport to spawn
      result.correctionPos = { 
        x: acState.lastValidX !== 0 ? acState.lastValidX : getSpawnParams().x, 
        y: acState.lastValidY !== 0 ? acState.lastValidY : getSpawnParams().y, 
        z: acState.lastValidZ !== 0 ? acState.lastValidZ : getSpawnParams().z 
      };
    }
    return result;
  }

  // 3. Validate Movement (Noclip, Speedhack)
  const movementResult = validateMovement(username, currentPos, newPos);
  if (!movementResult.valid) {
    acState.violationCount++;

    result.valid = false;

    if (movementResult.banReason) {
      result.ban = {
        reason: movementResult.banReason,
        durationMs: 5 * 60 * 1000,
      };
    } else {
      // Rubberband back to last valid
      result.correctionPos = {
        x: acState.lastValidX,
        y: acState.lastValidY,
        z: acState.lastValidZ,
      };
    }
  }

  return result;
}

export { getAcState, removeAcState, resetAcState };
export { isBanned, banPlayer } from "./bans";
