import * as THREE from 'three';
import { voxelGrid, colorNames, COLORS, VOXEL_SIZE, GRID_SIZE, HALF_GRID, Y_OFFSET, Y_SIZE } from '../../world/voxelMap';

export async function buildObbyWorldMap(scene: THREE.Scene, mapGroup: THREE.Group) {
  const materials: Record<string, THREE.MeshLambertMaterial> = {};
  
  // Pre-create materials based on our colors mapping
  for (const [name, hex] of Object.entries(COLORS)) {
    materials[name] = new THREE.MeshLambertMaterial({
      color: hex,
    });
  }

  const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
  
  // First, group coordinates by color to properly size each InstancedMesh
  const colorPositions = new Map<number, number[]>();
  for (let i = 0; i < colorNames.length; i++) {
    colorPositions.set(i + 1, []);
  }

  for (let gy = 0; gy < Y_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      for (let gz = 0; gz < GRID_SIZE; gz++) {
        const index = gx + gy * GRID_SIZE + gz * GRID_SIZE * Y_SIZE;
        const val = voxelGrid[index];
        if (val > 0) {
          const arr = colorPositions.get(val);
          if (arr) {
            arr.push(gx - HALF_GRID, gy - Y_OFFSET, gz - HALF_GRID);
          }
        }
      }
    }
  }

  const dummy = new THREE.Object3D();

  for (let colorId = 1; colorId <= colorNames.length; colorId++) {
    const positions = colorPositions.get(colorId)!;
    if (positions.length === 0) continue;

    const colorName = colorNames[colorId - 1];
    const instancedMesh = new THREE.InstancedMesh(geometry, materials[colorName], positions.length / 3);
    instancedMesh.castShadow = false;
    instancedMesh.receiveShadow = false;

    // Water transparency
    if (colorName === 'water' || colorName === 'waterLight') {
      instancedMesh.castShadow = false;
      materials[colorName].transparent = true;
      materials[colorName].opacity = 0.8;
    }

    let instanceId = 0;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1];
        const z = positions[i+2];
        
        // Scale the grid coordinates to actual 3D space
        const worldX = x * VOXEL_SIZE;
        const worldY = y * VOXEL_SIZE;
        const worldZ = z * VOXEL_SIZE;

        dummy.position.set(worldX, worldY, worldZ);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(instanceId++, dummy.matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    mapGroup.add(instancedMesh);
  }
}

