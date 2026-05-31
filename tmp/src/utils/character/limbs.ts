import * as THREE from 'three';

export function createArm(isRight: boolean, skinColor: string = '#ffdbac', primaryColor: string = '#3b82f6'): THREE.Group {
  const armPivotGroup = new THREE.Group();
  armPivotGroup.name = isRight ? 'armR' : 'armL';

  // The root coordinates (0, 0, 0) of this group act as the Shoulder Pivot Joint.
  // The arm geometry is offset downwards so it hinges correctly from the shoulder.
  const armW = 5.2;
  const armD = 5.2;
  
  // 1. Sleeve segment (connected to the shoulder joint)
  const sleeveH = 6.5;
  const sleeveGeom = new THREE.BoxGeometry(armW, sleeveH, armD);
  const sleeveMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.5 });
  const sleeveMesh = new THREE.Mesh(sleeveGeom, sleeveMat);
  sleeveMesh.position.y = -sleeveH / 2; // offset down
  sleeveMesh.castShadow = true;
  sleeveMesh.receiveShadow = true;
  armPivotGroup.add(sleeveMesh);

  // 2. Forearm skin segment
  const foreH = 11.5;
  const foreGeom = new THREE.BoxGeometry(armW - 0.2, foreH, armD - 0.2);
  const foreMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
  const foreMesh = new THREE.Mesh(foreGeom, foreMat);
  foreMesh.position.y = -sleeveH - foreH / 2; // further offset down
  foreMesh.castShadow = true;
  foreMesh.receiveShadow = true;
  armPivotGroup.add(foreMesh);

  // 3. Right arm gold status watch / Left arm sweatband details
  if (isRight) {
    const watchGeom = new THREE.BoxGeometry(armW + 0.5, 1.8, armD + 0.5);
    const watchMat = new THREE.MeshStandardMaterial({ 
      color: '#fbbf24', 
      roughness: 0.1, 
      metalness: 0.9,
      emissive: '#d97706',
      emissiveIntensity: 0.15
    });
    const watch = new THREE.Mesh(watchGeom, watchMat);
    watch.position.y = -sleeveH - 3;
    watch.castShadow = true;
    armPivotGroup.add(watch);
  } else {
    // Cool neon sweatband
    const bandGeom = new THREE.BoxGeometry(armW + 0.4, 2, armD + 0.4);
    const bandMat = new THREE.MeshStandardMaterial({ 
      color: '#ec4899', // bright hot pink sweatband
      roughness: 0.8,
      emissive: '#db2777',
      emissiveIntensity: 0.2
    });
    const band = new THREE.Mesh(bandGeom, bandMat);
    band.position.y = -sleeveH - 5;
    band.castShadow = true;
    armPivotGroup.add(band);
  }

  return armPivotGroup;
}

export function createLeg(isRight: boolean, legColor: string = '#1e293b'): THREE.Group {
  const legPivotGroup = new THREE.Group();
  legPivotGroup.name = isRight ? 'legR' : 'legL';

  // The root coordinates (0, 0, 0) of this group act as the Hip Pivot Joint.
  const legW = 6.2;
  const legD = 6.2;

  // 1. Shorts / Pant segment (connected to hip joint)
  const pantH = 6.0;
  const pantGeom = new THREE.BoxGeometry(legW, pantH, legD);
  const pantMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.7 });
  const pantMesh = new THREE.Mesh(pantGeom, pantMat);
  pantMesh.position.y = -pantH / 2; // offset down
  pantMesh.castShadow = true;
  pantMesh.receiveShadow = true;
  legPivotGroup.add(pantMesh);

  // 2. Calf / Socks segment
  const calfH = 4.0;
  const calfGeom = new THREE.BoxGeometry(legW - 0.2, calfH, legD - 0.2);
  const calfMat = new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.8 }); // white high-socks
  const calfMesh = new THREE.Mesh(calfGeom, calfMat);
  calfMesh.position.y = -pantH - calfH / 2;
  calfMesh.castShadow = true;
  calfMesh.receiveShadow = true;
  legPivotGroup.add(calfMesh);

  // 3. Thick Boot / Shoe details (extended forward for iconic block shoes)
  const bootH = 3.5;
  const bootGeom = new THREE.BoxGeometry(legW + 0.3, bootH, legD + 1.2); // extended Z (front-wards)
  const bootMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.8 }); // black boot leather
  const bootMesh = new THREE.Mesh(bootGeom, bootMat);
  bootMesh.position.set(0, -pantH - calfH - bootH / 2, 0.4); // center slightly forward
  bootMesh.castShadow = true;
  bootMesh.receiveShadow = true;
  legPivotGroup.add(bootMesh);

  return legPivotGroup;
}
