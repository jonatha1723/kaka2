import * as THREE from 'three';
import { WORLD_GRID, getFloorHeight, isHazardTile } from '../../world';
import { WORLD_SIZE, TILE_SIZE } from '../../constants';

export function buildObbyWorldMap(scene: THREE.Scene, mapGroup: THREE.Group) {
  // Materials dictionary
  const materials = {
    grassSafe: new THREE.MeshStandardMaterial({ color: '#17512a', roughness: 0.8 }),
    grassSafeAlt: new THREE.MeshStandardMaterial({ color: '#1f713e', roughness: 0.8 }),
    lobbySpawn: new THREE.MeshStandardMaterial({ color: '#0084c7', roughness: 0.5, metalness: 0.1, emissive: '#023c5c', emissiveIntensity: 0.15 }),
    wallBricks: new THREE.MeshStandardMaterial({ color: '#525a66', roughness: 0.9 }),
    solidPinkNeon: new THREE.MeshStandardMaterial({ color: '#e044c0', roughness: 0.4, emissive: '#740a6b', emissiveIntensity: 0.25 }),
    meltingLava: new THREE.MeshStandardMaterial({ color: '#ea383c', emissive: '#b21014', emissiveIntensity: 0.8 }),
    goldenFinish: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.2, metalness: 0.85, emissive: '#945800', emissiveIntensity: 0.1 }),
    // Classic Roblox rainbow neon materials!
    neonRed: new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#991b1b', emissiveIntensity: 0.6 }),
    neonOrange: new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#9a3412', emissiveIntensity: 0.6 }),
    neonYellow: new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#854d0e', emissiveIntensity: 0.6 }),
    neonGreen: new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#065f46', emissiveIntensity: 0.6 }),
    neonCyan: new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#075985', emissiveIntensity: 0.6 }),
    neonBlue: new THREE.MeshStandardMaterial({ color: '#3b82f6', emissive: '#1e40af', emissiveIntensity: 0.6 }),
    neonPurple: new THREE.MeshStandardMaterial({ color: '#8b5cf6', emissive: '#5b21b6', emissiveIntensity: 0.6 }),
    neonPink: new THREE.MeshStandardMaterial({ color: '#ec4899', emissive: '#9d174d', emissiveIntensity: 0.6 }),
  };

  const neonPalette = [
    materials.neonRed, materials.neonOrange, materials.neonYellow, materials.neonGreen,
    materials.neonCyan, materials.neonBlue, materials.neonPurple, materials.neonPink
  ];

  // Shared geometries to conserve GPU registers
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      const tile = WORLD_GRID[y][x];
      if (tile === 0) continue; // Skip void space

      // Determine elevation ranges depending on tile types
      let zMin = -20;
      let zMax = 0;
      let material: THREE.MeshStandardMaterial = materials.grassSafe;

      if (tile === 1) { // Sand/Grass Safe Floor
        const isCheck = (x + y) % 2 === 0;
        material = isCheck ? materials.grassSafe : materials.grassSafeAlt;
      } else if (tile === 5) { // Spawn platform marker
        material = materials.lobbySpawn;
      } else if (tile === 2) { // Tall Obstacle brick structure
        zMin = 0;
        zMax = 44;
        material = materials.wallBricks;
      } else if (tile === 4) { // Levitating checkpoint bridge stones
        zMin = 10;
        zMax = 20;
        material = materials.solidPinkNeon;
      } else if (tile === 3) { // Red Hot Sizzling Lava hazard
        zMin = -16;
        zMax = -1; // Sunk slightly
        material = materials.meltingLava;
      } else if (tile === 6) { // Final Winner pedestal
        zMax = getFloorHeight(6, x, y);
        zMin = zMax - 8;
        material = materials.goldenFinish;
      } else if (tile >= 10 && tile <= 99) { // Dynamic Step Plates (Rainbow theme!)
        zMax = getFloorHeight(tile, x, y);
        zMin = zMax - 8;
        const idx = (tile - 10) % neonPalette.length;
        material = neonPalette[idx];
      } else if (tile >= 100 && tile <= 120) { // Dynamic Sky Lava blocks directly on path!
        zMax = getFloorHeight(tile, x, y);
        zMin = zMax - 14; 
        material = materials.meltingLava;
      }

      const height = zMax - zMin;
      const mesh = new THREE.Mesh(boxGeometry, material);
      mesh.scale.set(TILE_SIZE, height, TILE_SIZE);

      // Map server coordinates to 3D Space:
      // x -> Horizontal X
      // (zMin + zMax)/2 -> Vertical Height position Y
      // y -> Depth position Z
      const worldX = (x + 0.5) * TILE_SIZE;
      const worldY = (zMin + zMax) / 2;
      const worldZ = (y + 0.5) * TILE_SIZE;

      mesh.position.set(worldX, worldY, worldZ);
      
      mesh.castShadow = !isHazardTile(tile); // lava shouldn't cast shadows, it's glowing!
      mesh.receiveShadow = true;
      
      mapGroup.add(mesh);

      // If it is the Trophy Gold Pedestal, add an actual floating trophies emblem!
      if (tile === 6) {
        const cupMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(8, 2, 14, 8),
          materials.goldenFinish
        );
        cupMesh.position.set(worldX, zMax + 12, worldZ);
        cupMesh.castShadow = true;
        mapGroup.add(cupMesh);
      }
    }
  }
}
