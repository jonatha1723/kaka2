export const VOXEL_SIZE = 14;
export const GRID_SIZE = 120;
export const HALF_GRID = Math.floor(GRID_SIZE / 2);
export const Y_OFFSET = 10;
export const Y_SIZE = 60; // Allows y from -10 to 49

export const heightMap = new Int16Array(GRID_SIZE * GRID_SIZE);
heightMap.fill(-9999);

// 3D Grid: x, y, z -> Color Index + 1. (0 = empty)
// Length = GRID_SIZE * Y_SIZE * GRID_SIZE (approx 6.9 MB, very lightweight)
export const voxelGrid = new Uint8Array(GRID_SIZE * Y_SIZE * GRID_SIZE);

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

export const colorNames = Object.keys(COLORS);
const colorToIndex = new Map(colorNames.map((c, i) => [c, i]));

export function getGridIndex(x: number, y: number, z: number): number {
  const gx = Math.round(x) + HALF_GRID;
  const gy = Math.round(y) + Y_OFFSET;
  const gz = Math.round(z) + HALF_GRID;
  if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= Y_SIZE || gz < 0 || gz >= GRID_SIZE) return -1;
  return gx + gy * GRID_SIZE + gz * GRID_SIZE * Y_SIZE;
}

export function addVoxel(x: number, y: number, z: number, colorName: string) {
  const index = getGridIndex(x, y, z);
  if (index === -1) return; // Out of bounds

  // Prevent duplicate blocks at same place (Z-fighting)
  if (voxelGrid[index] !== 0) return;

  const colorId = colorToIndex.get(colorName);
  if (colorId === undefined) return;

  // Store in 3D grid
  voxelGrid[index] = colorId + 1;

  const isWater = colorName === "water" || colorName === "waterLight";
  const gx = Math.round(x) + HALF_GRID;
  const gz = Math.round(z) + HALF_GRID;
  if (gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE) {
    const mapKey = gx + gz * GRID_SIZE;
    if (!isWater) {
      if (y > heightMap[mapKey]) {
        heightMap[mapKey] = y;
      }
    }
  }
}
