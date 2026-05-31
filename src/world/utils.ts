import { VOXEL_SIZE, GRID_SIZE, heightMap, HALF_GRID } from './voxelMap';

export function getBlockingWallHeight(px: number, py: number, radius: number = 10): number {
  const minVx = Math.floor((px - radius) / VOXEL_SIZE);
  const maxVx = Math.floor((px + radius) / VOXEL_SIZE);
  const minVz = Math.floor((py - radius) / VOXEL_SIZE);
  const maxVz = Math.floor((py + radius) / VOXEL_SIZE);

  let maxFoundHeight = -999;

  for (let vz = minVz; vz <= maxVz; vz++) {
    for (let vx = minVx; vx <= maxVx; vx++) {
      if (vx >= -GRID_SIZE/2 && vx <= GRID_SIZE/2 && vz >= -GRID_SIZE/2 && vz <= GRID_SIZE/2) {
        
        const tileMinX = vx * VOXEL_SIZE - VOXEL_SIZE/2;
        const tileMaxX = vx * VOXEL_SIZE + VOXEL_SIZE/2;
        const tileMinZ = vz * VOXEL_SIZE - VOXEL_SIZE/2;
        const tileMaxZ = vz * VOXEL_SIZE + VOXEL_SIZE/2;

        const cx = Math.max(tileMinX, Math.min(tileMaxX, px));
        const cz = Math.max(tileMinZ, Math.min(tileMaxZ, py));

        const dx = px - cx;
        const dz = py - cz;
        const distSq = dx * dx + dz * dz;

        if (distSq <= radius * radius) {
          const gx = vx + HALF_GRID;
          const gz = vz + HALF_GRID;
          let h = -999;
          if (gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE) {
            h = heightMap[gx + gz * GRID_SIZE];
          }

          if (h !== -9999 && h !== -999) {
            h = h * VOXEL_SIZE + (VOXEL_SIZE / 2); // world height
            if (h > maxFoundHeight) {
              maxFoundHeight = h;
            }
          }
        }
      }
    }
  }
  return maxFoundHeight;
}

export function getStandableFloorState(px: number, py: number, pz: number, radius: number = 14): { floorHeight: number, tileType: number } {
  const minVx = Math.floor((px - radius) / VOXEL_SIZE);
  const maxVx = Math.floor((px + radius) / VOXEL_SIZE);
  const minVz = Math.floor((py - radius) / VOXEL_SIZE); // py is z in our world layout
  const maxVz = Math.floor((py + radius) / VOXEL_SIZE);

  let bestFloorHeight = -999;
  let bestTileType = 0;

  for (let vz = minVz; vz <= maxVz; vz++) {
    for (let vx = minVx; vx <= maxVx; vx++) {
      if (vx >= -GRID_SIZE/2 && vx <= GRID_SIZE/2 && vz >= -GRID_SIZE/2 && vz <= GRID_SIZE/2) {
        
        const tileMinX = vx * VOXEL_SIZE - VOXEL_SIZE/2;
        const tileMaxX = vx * VOXEL_SIZE + VOXEL_SIZE/2;
        const tileMinZ = vz * VOXEL_SIZE - VOXEL_SIZE/2;
        const tileMaxZ = vz * VOXEL_SIZE + VOXEL_SIZE/2;

        const cx = Math.max(tileMinX, Math.min(tileMaxX, px));
        const cz = Math.max(tileMinZ, Math.min(tileMaxZ, py));

        const dx = px - cx;
        const dz = py - cz;
        const distSq = dx * dx + dz * dz;

        if (distSq <= radius * radius) {
          const gx = vx + HALF_GRID;
          const gz = vz + HALF_GRID;
          let h = -999;
          if (gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE) {
            h = heightMap[gx + gz * GRID_SIZE];
          }
          
          if (h !== -9999 && h !== -999) {
            // Convert to world height coordinates
            h = h * VOXEL_SIZE + (VOXEL_SIZE / 2);
            if (h <= pz + 8.5) {
              if (h > bestFloorHeight) {
                bestFloorHeight = h;
                bestTileType = 1; // Safe standable block
              }
            }
          }
        }
      }
    }
  }

  return { floorHeight: bestFloorHeight, tileType: bestTileType };
}
