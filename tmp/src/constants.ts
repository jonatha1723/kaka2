/**
 * Global game constants and configuration for Blox Orbins.
 */

export const WORLD_SIZE = 54;
export const TILE_SIZE = 40;

export interface SpawnParams {
  x: number;
  y: number;
  z: number;
}

export function getSpawnParams(): SpawnParams {
  // Center of our newly expanded 14x14 safe lobby is around tiles x=26.5, y=26.5.
  // 1 tile = 40 units of width/length.
  return {
    x: 26.5 * TILE_SIZE,
    y: 26.5 * TILE_SIZE,
    z: 0
  };
}
