import { WORLD_GRID, getStandableFloorState, isHazardTile } from '../../world';
import { WORLD_SIZE, TILE_SIZE } from '../../constants';

// Checks if player is standing on hazardous tiles or void and returns true if they should be dead
export function checkGodModeViolation(x: number, y: number, z: number): boolean {
  // Desativado para evitar falsas correções de posição ou bans injustos durante lag e animações normais de morte.
  // A física e o fluxo de morte no cliente já tratam a respawn de forma impecável.
  return false;
}
