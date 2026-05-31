import { Object3D, Color } from "three";

export const VOXEL_SIZE = 14;
export const GRID_SIZE = 120;

export interface VoxelData {
  x: number;
  y: number;
  z: number;
  colorName: string;
}

export const heightMap = new Map<string, number>();

export const COLORS: Record<string, string> = {
  grassDark: "#3a5e1e",
  grassMid: "#4c7a27",
  grassLight: "#649e35",
  water: "#295952",
  waterLight: "#39736b",
  path: "#cccccc",
  pathEdge: "#aaaaaa",
  pagodaRed: "#c92a1c",
  pagodaRedDark: "#941a10",
  pagodaRoof: "#2b3036",
  pagodaRoofEdge: "#434b54",
  pagodaBase: "#eeeeee",
  pagodaGold: "#d4af37",
  treeDark: "#1f4019",
  treeMid: "#2b5c21",
  treeLight: "#4a8536",
  treeYellowish: "#7a9930",
  trunk: "#4a3b2c",
};

export function generateVoxels(): VoxelData[] {
  const voxels: VoxelData[] = [];
  const voxelMap = new Map<string, boolean>();

  function addVoxel(x: number, y: number, z: number, colorName: string) {
    const key = `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    if (!voxelMap.has(key)) {
      voxels.push({ x, y, z, colorName });
      voxelMap.set(key, true);

      const isWater = colorName === "water" || colorName === "waterLight";
      const mapKey = `${Math.round(x)},${Math.round(z)}`;
      const currentH = heightMap.get(mapKey) ?? -999;
      if (!isWater) {
        // Solid block
        if (y > currentH) heightMap.set(mapKey, y);
      }
    }
  }

  // 1. Terrain & Water
  const halfGrid = GRID_SIZE / 2;
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
      } else {
        // Deterministic noise for stable seeds
        const noise = Math.abs(Math.sin(x * 7.1 + z * 11.3));
        let col = "grassMid";
        if (noise > 0.8) col = "grassLight";
        if (noise < 0.2) col = "grassDark";

        for (let fillY = y; fillY >= -2; fillY--) {
          addVoxel(x, fillY, z, col);
        }
      }

      const pathCurve = Math.cos(z * 0.08) * 10;
      const distToPath = Math.abs(x - pathCurve + 20);
      if (distToPath < 3 && z > -30 && z < 40 && distToRiver >= 8) {
        addVoxel(x, y + 1, z, distToPath > 2 ? "pathEdge" : "path");
      }
    }
  }

  // 2. The Pagoda
  function buildPagoda(startX: number, startZ: number) {
    let y = 1;
    const baseSize = 14;
    for (let bx = -baseSize; bx <= baseSize; bx++) {
      for (let bz = -baseSize; bz <= baseSize; bz++) {
        if (Math.abs(bx) === baseSize || Math.abs(bz) === baseSize) {
          if (bx % 2 === 0 || bz % 2 === 0) {
            addVoxel(startX + bx, y, startZ + bz, "pagodaRed");
            addVoxel(startX + bx, y + 1, startZ + bz, "pagodaRed");
          }
          addVoxel(startX + bx, y, startZ + bz, "pagodaBase");
        } else {
          addVoxel(startX + bx, y, startZ + bz, "pagodaBase");
        }
      }
    }
    y += 1;

    const tiers = 7;
    let currentWidth = 9;

    for (let t = 0; t < tiers; t++) {
      const wallHeight = 4;
      const roofOverhang = 3;

      for (let wx = -currentWidth; wx <= currentWidth; wx++) {
        for (let wz = -currentWidth; wz <= currentWidth; wz++) {
          if (
            Math.abs(wx) === currentWidth ||
            Math.abs(wz) === currentWidth ||
            Math.abs(wx) === currentWidth - 1 ||
            Math.abs(wz) === currentWidth - 1
          ) {
            for (let h = 0; h < wallHeight; h++) {
              let wallCol = "pagodaRed";
              if (h === wallHeight - 1) wallCol = "pagodaBase";
              if (wx % 3 === 0 && wz % 3 === 0 && h > 0)
                wallCol = "pagodaRedDark";
              addVoxel(startX + wx, y + h, startZ + wz, wallCol);
            }
          }
        }
      }
      y += wallHeight;

      const roofWidth = currentWidth + roofOverhang;
      for (let rx = -roofWidth; rx <= roofWidth; rx++) {
        for (let rz = -roofWidth; rz <= roofWidth; rz++) {
          const distFromCenter = Math.max(Math.abs(rx), Math.abs(rz));
          const distanceFromEdge = roofWidth - distFromCenter;
          let ry = y + Math.floor(distanceFromEdge * 0.6);
          if (distFromCenter === roofWidth && Math.abs(rx) === Math.abs(rz)) {
            ry += 1;
            addVoxel(startX + rx, ry, startZ + rz, "pagodaGold");
          } else {
            addVoxel(
              startX + rx,
              ry,
              startZ + rz,
              distFromCenter === roofWidth ? "pagodaRoofEdge" : "pagodaRoof",
            );
          }
        }
      }

      for (let h = 0; h < 2; h++) {
        for (let rx = -currentWidth; rx <= currentWidth; rx++) {
          for (let rz = -currentWidth; rz <= currentWidth; rz++) {
            addVoxel(startX + rx, y + h, startZ + rz, "pagodaRoof");
          }
        }
      }
      y += 2;
      currentWidth -= 1;
    }

    for (let s = 0; s < 12; s++) {
      let width = s < 2 ? 2 : s % 2 === 0 ? 1 : 0;
      for (let px = -width; px <= width; px++) {
        for (let pz = -width; pz <= width; pz++) {
          addVoxel(startX + px, y + s, startZ + pz, "pagodaGold");
        }
      }
    }
  }

  // 3. Trees
  function buildTree(x: number, y: number, z: number, type: string) {
    const trunkHeight = Math.floor(Math.abs(Math.sin(x * 3 + z * 7)) * 3) + 2;
    for (let h = 0; h < trunkHeight; h++) {
      addVoxel(x, y + h, z, "trunk");
    }
    let leafY = y + trunkHeight;

    if (type === "pine") {
      const height = Math.floor(Math.abs(Math.sin(x * 11 + z * 13)) * 6) + 8;
      let radius = 4;
      for (let h = 0; h < height; h++) {
        for (let lx = -radius; lx <= radius; lx++) {
          for (let lz = -radius; lz <= radius; lz++) {
            if (
              Math.sqrt(lx * lx + lz * lz) <=
              radius + Math.abs(Math.sin(lx + lz)) * 0.5
            ) {
              addVoxel(
                x + lx,
                leafY + h,
                z + lz,
                h % 2 === 0 ? "treeDark" : "treeMid",
              );
            }
          }
        }
        if (h % 2 !== 0 && radius > 0) radius--;
      }
    } else {
      const radius = Math.floor(Math.abs(Math.sin(x * 17 + z * 19)) * 3) + 2;
      const noiseCol = Math.abs(Math.sin(x * 23 + z * 29));
      const col =
        noiseCol > 0.7
          ? "treeYellowish"
          : noiseCol > 0.5
            ? "treeLight"
            : "treeMid";

      for (let lx = -radius; lx <= radius; lx++) {
        for (let ly = -radius; ly <= radius; ly++) {
          for (let lz = -radius; lz <= radius; lz++) {
            if (
              Math.sqrt(lx * lx + ly * ly + lz * lz) <=
              radius + Math.abs(Math.sin(lx + ly + lz))
            ) {
              if (leafY + ly > y) {
                addVoxel(x + lx, leafY + ly, z + lz, col);
              }
            }
          }
        }
      }
    }
  }

  const pagodaX = 15;
  const pagodaZ = 10;
  buildPagoda(pagodaX, pagodaZ);

  // Scatter Trees (Deterministic)
  let treeCount = 0;
  for (let i = 0; i < 200; i++) {
    const tx = Math.floor(
      (Math.abs(Math.sin(i * 1.1)) - 0.5) * (GRID_SIZE - 10),
    );
    const tz = Math.floor(
      (Math.abs(Math.cos(i * 1.3)) - 0.5) * (GRID_SIZE - 10),
    );

    if (Math.abs(tx - pagodaX) < 18 && Math.abs(tz - pagodaZ) < 18) continue;

    let ty = 0;
    const distToCenter = Math.sqrt(tx * tx + tz * tz);
    if (distToCenter > 30) {
      ty = Math.floor(Math.sin(tx * 0.1) * Math.cos(tz * 0.1) * 3);
      if (ty < 0) ty = 0;
    }
    const riverCurve = Math.sin(tx * 0.05) * 15;
    const distToRiver = Math.abs(tz - riverCurve - 10);
    if (distToRiver < 10 && tx < 30) continue;

    const type = Math.abs(Math.sin(i * 1.7)) > 0.4 ? "round" : "pine";
    buildTree(tx, ty + 1, tz, type);
    treeCount++;
    if (treeCount > 150) break;
  }

  return voxels;
}

// Generate it once when imported
export const generatedVoxelData = generateVoxels();
