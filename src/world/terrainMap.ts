import { addVoxel } from './voxelState';

export function buildTerrain(halfGrid: number) {
  for (let x = -halfGrid; x <= halfGrid; x++) {
    for (let z = -halfGrid; z <= halfGrid; z++) {
      const riverCurve = Math.sin(x * 0.05) * 15;
      const distToRiver = Math.abs(z - riverCurve - 10);

      let y = 0;
      const distToCenter = Math.sqrt(x * x + z * z);
      if (distToCenter > 30) {
        y = Math.floor(Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3);
        if (y < 0) y = 0;
      }

      if (distToRiver < 8 && x < 30) {
        y = -1;
        const isEdge = distToRiver > 6;
        addVoxel(x, y, z, isEdge ? "waterLight" : "water");
        // Add solid blocks below water to prevent falling into the void
        addVoxel(x, y - 1, z, "grassMid");
        addVoxel(x, y - 2, z, "grassDark");
      } else {
        const noise = Math.abs(Math.sin(x * 7.1 + z * 11.3));
        let col = "grassMid";
        if (noise > 0.8) col = "grassLight";
        if (noise < 0.2) col = "grassDark";

        addVoxel(x, y, z, col);
        // Only one solid block below to prevent limbo
        if (y > 0) addVoxel(x, y - 1, z, "grassMid");
      }

      const pathCurve = Math.cos(z * 0.08) * 10;
      const distToPath = Math.abs(x - pathCurve + 20);
      if (distToPath < 3 && z > -30 && z < 40 && distToRiver >= 8) {
        addVoxel(x, y + 1, z, distToPath > 2 ? "pathEdge" : "path");
      }
    }
  }
}
