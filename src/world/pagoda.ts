import { addVoxel } from './voxelState';

export function buildPagoda(startX: number, startZ: number) {
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
