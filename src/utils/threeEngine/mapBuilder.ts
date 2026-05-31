import * as THREE from 'three';
import { generatedVoxelData, VOXEL_SIZE, COLORS } from '../../world/voxelMap';

export function buildObbyWorldMap(scene: THREE.Scene, mapGroup: THREE.Group) {
  const materials: Record<string, THREE.MeshStandardMaterial> = {};
  
  // Pre-create materials based on our colors mapping
  for (const [name, hex] of Object.entries(COLORS)) {
    materials[name] = new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.8,
      metalness: 0.1
    });
  }

  const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);

  // Group voxels by color so we can create one InstancedMesh per color
  const voxelsByColor = new Map<string, typeof generatedVoxelData>();
  for (const v of generatedVoxelData) {
    if (!voxelsByColor.has(v.colorName)) {
      voxelsByColor.set(v.colorName, []);
    }
    voxelsByColor.get(v.colorName)!.push(v);
  }

  const dummy = new THREE.Object3D();

  for (const [colorName, voxels] of voxelsByColor) {
    const instancedMesh = new THREE.InstancedMesh(geometry, materials[colorName], voxels.length);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    // Water shouldn't cast shadow
    if (colorName === 'water' || colorName === 'waterLight') {
      instancedMesh.castShadow = false;
      materials[colorName].transparent = true;
      materials[colorName].opacity = 0.8;
      materials[colorName].roughness = 0.2;
    }

    for (let i = 0; i < voxels.length; i++) {
        const v = voxels[i];
        
        // Scale the grid coordinates to actual 3D space
        const worldX = v.x * VOXEL_SIZE;
        const worldY = v.y * VOXEL_SIZE;
        const worldZ = v.z * VOXEL_SIZE;

        dummy.position.set(worldX, worldY, worldZ);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    mapGroup.add(instancedMesh);
  }
}

