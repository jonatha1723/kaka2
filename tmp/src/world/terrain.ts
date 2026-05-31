import { WORLD_SIZE, TILE_SIZE } from '../constants';

export function getFloorHeight(tileType: number, x?: number, y?: number): number {
  if (tileType === 0) return -999;
  if (tileType === 1) return 0;   // Grass Safe Floor
  if (tileType === 5) return 0;   // Spawn Lobby floor
  if (tileType === 3) return -1;  // Ground Lava
  
  if (tileType === 6) {           // Goal platform / Trophy pedestal
    if (x !== undefined && y !== undefined) {
      if (y >= 25 && y <= 29 && x >= 42) {
        return 90; // Tower Climb peak height
      }
      if (y >= 43 && x >= 25 && x <= 29) {
        return 50; // South Zigzag Peak height
      }
      if (y >= 38 && x >= 35) {
        return 253; // Ultimate Heaven Cloud Castle Goal!
      }
      if (y === 13 && x === 11) {
        return 20; // West floating steps goal height
      }
    }
    return 6; // Standard ground goal (e.g. Lava Corridor)
  }
  
  if (tileType === 2) return 0;   // Tall Wall obstacle (collidable)
  if (tileType === 4) return 20;  // Levitating platforms
  
  // Custom height mapping for tiles 10 to 99!
  if (tileType >= 10 && tileType <= 99) {
    return (tileType - 10) * 8 + 15;
  }
  // Sky Lava hazards
  if (tileType >= 100 && tileType <= 120) {
    return (tileType - 100) * 8 + 15; 
  }
  return 0;
}

export function isHazardTile(tileType: number): boolean {
  if (tileType === 3) return true; // Ground Lava
  if (tileType >= 100 && tileType <= 120) return true; // Sky Lava Jumps
  return false;
}
