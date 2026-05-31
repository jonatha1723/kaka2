import { buildTerrain } from "./terrainMap";
import { buildPagoda } from "./pagoda";
import { voxelGrid, colorNames, COLORS, GRID_SIZE, HALF_GRID, Y_OFFSET, Y_SIZE, heightMap, VOXEL_SIZE, addVoxel } from "./voxelState";

export { VOXEL_SIZE, GRID_SIZE, HALF_GRID, Y_OFFSET, Y_SIZE, heightMap, COLORS, colorNames, voxelGrid };

export function generateVoxels() {
  // Clear any existing generation
  voxelGrid.fill(0);
  heightMap.fill(-9999);

  // 1. Terrain & Water
  const halfGrid = GRID_SIZE / 2;
  buildTerrain(halfGrid);

  // 2. The Pagoda
  const pagodaX = 15;
  const pagodaZ = 10;
  buildPagoda(pagodaX, pagodaZ);
}

// Deterministic instant generation (runs locally on both client and server automatically without lag due to new Uint8Array)
generateVoxels();
