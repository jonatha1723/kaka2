/**
 * Global game constants and configuration for Blox Orbins.
 */

export const WORLD_SIZE = 54;
export const TILE_SIZE = 40;

export interface SpawnParams {
  x: number;
  y: number;
  z: number; // Z is vertical up
}

export function getSpawnParams(): SpawnParams {
  // Center of the map
  return {
    x: 0,
    y: 0,
    z: 40
  };
}
