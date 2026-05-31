import { AntiCheatPlayerState } from "./state";
import { getStandableFloorState } from "../../world";

const FLY_TIME_MAX_MS = 15000; // 15 seconds in the air to prevent false positives during high jumps, slides, or lag
const BAN_DURATION_MS = 0; // No automatic bans for flight to prevent false-positives

export interface FlightResult {
  valid: boolean;
  banReason?: string;
  durationMs?: number;
}

export function validateFlight(
  acState: AntiCheatPlayerState,
  newPos: { x: number; y: number; z: number; dz: number },
): FlightResult {
  const { floorHeight } = getStandableFloorState(
    newPos.x,
    newPos.y,
    newPos.z,
    14,
  );
  const now = Date.now();

  // If player is on the floor (or dead/falling into void), they are not flying
  if ((floorHeight !== -999 && newPos.z <= floorHeight + 5) || newPos.z < -20) {
    acState.airTimeStart = null;
    return { valid: true };
  }

  // They are in the air
  if (acState.airTimeStart === null) {
    acState.airTimeStart = now;
  } else {
    const timeInAir = now - acState.airTimeStart;

    // Se ficou no ar de forma fraudulenta
    if (timeInAir > FLY_TIME_MAX_MS) {
      // Reposição / Rubberband apenas se estiver realmente pairando no ar (velocidade vertical perto de zero ou subindo)
      if (newPos.dz >= -20 && newPos.dz <= 20) {
        acState.airTimeStart = null;
        return { valid: false }; // Apenas invalida a posição para forçar borracha de volta, sem banir
      }

      // Se estiver caindo rápido no vazio, deixa cair livremente
      acState.airTimeStart = null;
      return { valid: true };
    }
  }

  return { valid: true };
}
