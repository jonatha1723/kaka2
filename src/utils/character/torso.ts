import * as THREE from 'three';

export function createTorso(primaryColor: string = '#3b82f6'): THREE.Group {
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'torso_assembly';

  // 1. Core Block Torso
  // Roblox torso dimensions: roughly 15 wide, 20 high, 10 deep (similar to original 16, 20, 10)
  const torsoW = 15;
  const torsoH = 20;
  const torsoD = 9.5;
  const torsoGeom = new THREE.BoxGeometry(torsoW, torsoH, torsoD);
  const torsoMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.5 });
  const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);
  torsoMesh.name = 'torso'; // This is referenced by some animation properties if needed
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // 2. Front Graphic Print - "Golden Star Insignia" (cool Roblox decal simulation)
  const starGroup = new THREE.Group();
  starGroup.position.z = torsoD / 2 + 0.15; // slightly offset from face of chest

  const starCenterGeom = new THREE.BoxGeometry(4.5, 4.5, 0.3);
  const starMat = new THREE.MeshStandardMaterial({ 
    color: '#fbbf24', 
    roughness: 0.2, 
    metalness: 0.8,
    emissive: '#d97706',
    emissiveIntensity: 0.3
  });
  const starCenter = new THREE.Mesh(starCenterGeom, starMat);
  starGroup.add(starCenter);

  // Cross bars of emblem to look like a badge / star
  const cross1Geom = new THREE.BoxGeometry(7, 2, 0.25);
  const cross1 = new THREE.Mesh(cross1Geom, starMat);
  starGroup.add(cross1);

  const cross2Geom = new THREE.BoxGeometry(2, 7, 0.25);
  const cross2 = new THREE.Mesh(cross2Geom, starMat);
  starGroup.add(cross2);

  torsoGroup.add(starGroup);

  // 3. Side Racing Stripes (cool character attire details)
  const stripeGeom = new THREE.BoxGeometry(0.3, torsoH - 4, torsoD - 2);
  const stripeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
  
  const stripeL = new THREE.Mesh(stripeGeom, stripeMat);
  stripeL.position.x = -torsoW / 2 - 0.05;
  torsoGroup.add(stripeL);

  const stripeR = new THREE.Mesh(stripeGeom, stripeMat);
  stripeR.position.x = torsoW / 2 + 0.05;
  torsoGroup.add(stripeR);

  // 4. Heavy Utility Belt (Black trim at the bottom of torso)
  const beltGeom = new THREE.BoxGeometry(torsoW + 0.5, 2.5, torsoD + 0.5);
  const beltMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });
  const beltMesh = new THREE.Mesh(beltGeom, beltMat);
  beltMesh.position.y = -torsoH / 2 + 1.25;
  beltMesh.castShadow = true;
  torsoGroup.add(beltMesh);

  // Belt Buckle (Gold accent in physical center)
  const buckleGeom = new THREE.BoxGeometry(2.5, 1.8, 0.5);
  const buckleMesh = new THREE.Mesh(buckleGeom, starMat);
  buckleMesh.position.set(0, -torsoH / 2 + 1.25, torsoD / 2 + 0.3);
  buckleMesh.castShadow = true;
  torsoGroup.add(buckleMesh);

  return torsoGroup;
}
