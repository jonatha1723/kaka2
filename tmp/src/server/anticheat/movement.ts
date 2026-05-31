import { PlayerData } from "../../types";
import { getAcState } from "./state";
import { WORLD_GRID, getStandableFloorState, isHazardTile } from "../../world";
import { WORLD_SIZE, TILE_SIZE, getSpawnParams } from "../../constants";

// Next-Gen 2026 Vanguard-style server-side checking
const MAX_SPEED = 248;
const SPEED_TOLERANCE = 1.3;
const MAX_JUMP_HEIGHT = 80; // Increased to avoid false positives on normal jumps

export interface MovementResult {
  valid: boolean;
  banReason?: string;
}

export function validateMovement(
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
): MovementResult {
  const acState = getAcState(username);
  const now = Date.now();
  const rawDt = (now - acState.lastPosTime) / 1000;
  acState.lastPosTime = now;

  // Tolerância a lag/latência: se ficar mais de 1.5s sem atualizar,
  // aceitamos a nova posição para evitar falso sppedhack na recuperação de lag.
  if (rawDt > 1.5) {
    acState.lastValidX = newPos.x;
    acState.lastValidY = newPos.y;
    acState.lastValidZ = newPos.z;
    return { valid: true };
  }

  const dt = Math.max(0.016, Math.min(rawDt, 1.5));

  if (acState.lastValidX === 0 && acState.lastValidY === 0) {
    acState.lastValidX = newPos.x;
    acState.lastValidY = newPos.y;
    acState.lastValidZ = newPos.z;
    return { valid: true }; // Let them initialize
  }

  // 1. ADVANCED KINEMATIC SPEED HACK CHECK
  const dist2D = Math.sqrt(
    (newPos.x - currentPos.x) ** 2 + (newPos.y - currentPos.y) ** 2,
  );
  
  // To avoid false positives from network network jitter (where 2 packets arrive instantly on the server), 
  // we give a much more generous base distance grace.
  const expectedMaxDist = Math.max(MAX_SPEED * 2.0 * dt, 100) + 50; 

  // Rubberband only if they genuinely teleport far beyond normal bounds and network lag tolerances
  if (dist2D > expectedMaxDist && dist2D > 150 && dt < 1) {
    return { valid: false };
  }

  // 2. NOCLIP/SOLID-STATE COLLISION CHECK
  const gridX = Math.floor(newPos.x / TILE_SIZE);
  const gridY = Math.floor(newPos.y / TILE_SIZE);

  if (gridX >= 0 && gridX < WORLD_SIZE && gridY >= 0 && gridY < WORLD_SIZE) {
    if (WORLD_GRID[gridY][gridX] === 2) {
      // Wall height is typically 30-40. If they jump over it, let them pass.
      if (newPos.z < 40) {
        console.log(
          `[Vanguard-2026] NoClip detectado para ${username} na parede (${gridX}, ${gridY})`,
        );
        return { valid: false };
      }
    }
  }

  // Update last valid
  acState.lastValidX = newPos.x;
  acState.lastValidY = newPos.y;
  acState.lastValidZ = newPos.z;

  return { valid: true };
}
