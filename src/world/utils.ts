import { VOXEL_SIZE, GRID_SIZE, heightMap } from './voxelMap';

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
          const mapKey = `${vx},${vz}`;
          let h = heightMap.get(mapKey) ?? -999;
          if (h !== -999) {
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
  
  // tileType was used to detect hazards, sky islands, etc.
  // 1 is safe ground, 3 is hazard lava (which we removed), so we will just return 1 if we found ground.
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
          const mapKey = `${vx},${vz}`;
          let h = heightMap.get(mapKey) ?? -999;
          
          if (h !== -999) {
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

  // Water level is basically slightly under 0
  if (bestFloorHeight === -999 && pz > -10) {
    // maybe underwater? If they hit the 'water' block bounding box
    // Voxel height of water is -1, so world height is -1*VOXEL_SIZE
    // We can also let them fall or 'swim' if needed, but since safe tile=1, maybe we just don't stand on water and fall until resetting
  }

  return { floorHeight: bestFloorHeight, tileType: bestTileType };
}
