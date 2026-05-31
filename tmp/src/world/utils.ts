import { WORLD_SIZE, TILE_SIZE } from '../constants';
import { WORLD_GRID } from './grid';
import { getFloorHeight } from './terrain';

export function getStandableFloorState(px: number, py: number, pz: number, radius: number = 14): { floorHeight: number, tileType: number } {
  const minTileX = Math.floor((px - radius) / TILE_SIZE);
  const maxTileX = Math.floor((px + radius) / TILE_SIZE);
  const minTileY = Math.floor((py - radius) / TILE_SIZE);
  const maxTileY = Math.floor((py + radius) / TILE_SIZE);

  let bestFloorHeight = -999;
  let bestTileType = 0;

  for (let ty = minTileY; ty <= maxTileY; ty++) {
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      if (tx >= 0 && tx < WORLD_SIZE && ty >= 0 && ty < WORLD_SIZE) {
        const tileType = WORLD_GRID[ty][tx];
        
        const tileMinX = tx * TILE_SIZE;
        const tileMaxX = (tx + 1) * TILE_SIZE;
        const tileMinY = ty * TILE_SIZE;
        const tileMaxY = (ty + 1) * TILE_SIZE;

        const cx = Math.max(tileMinX, Math.min(tileMaxX, px));
        const cy = Math.max(tileMinY, Math.min(tileMaxY, py));

        const dx = px - cx;
        const dy = py - cy;
        const distSq = dx * dx + dy * dy;

        if (distSq <= radius * radius) {
          const h = getFloorHeight(tileType, tx, ty);
          if (h <= pz + 8.5) {
            if (h > bestFloorHeight) {
              bestFloorHeight = h;
              bestTileType = tileType;
            }
          }
        }
      }
    }
  }

  return { floorHeight: bestFloorHeight, tileType: bestTileType };
}
