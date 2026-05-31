import * as THREE from 'three';

export function createHead(skinColor: string = '#ffdbac'): THREE.Group {
  const headGroup = new THREE.Group();
  headGroup.name = 'head_assembly';

  // 1. Core Block Head (Roblox Classic format)
  // Dimensions match standard ratio: roughly 10 x 10 x 10 (or 11 x 11 x 11 in original file)
  const headSize = 10;
  const headGeom = new THREE.BoxGeometry(headSize, headSize, headSize);
  const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  const headMesh = new THREE.Mesh(headGeom, headMat);
  headMesh.name = 'head'; // This is the core mesh name predicted by nameplates
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // 2. Roblox Classic Top Head-Stud (looks like a Legoblox stud!)
  const studGeom = new THREE.CylinderGeometry(2, 2, 1.5, 8);
  const studMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  const studMesh = new THREE.Mesh(studGeom, studMat);
  studMesh.position.y = headSize / 2 + 0.75;
  studMesh.castShadow = true;
  headGroup.add(studMesh);

  // 3. Face Details Group
  const faceGroup = new THREE.Group();
  faceGroup.position.z = headSize / 2 + 0.1; // Slightly offset forward to prevent z-fighting

  // Classic Eyes (Left and Right - deep black boxes)
  const eyeGeom = new THREE.BoxGeometry(1.6, 2, 0.4);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#111111' });
  
  const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
  eyeL.position.set(-2, 1, 0);
  faceGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
  eyeR.position.set(2, 1, 0);
  faceGroup.add(eyeR);

  // Classic Roblox smiley mouth (wide u-shape smile plate)
  const mouthWidth = 3.5;
  const mouthHeight = 1;
  const mouthGeom = new THREE.BoxGeometry(mouthWidth, mouthHeight, 0.4);
  const mouthMesh = new THREE.Mesh(mouthGeom, eyeMat);
  mouthMesh.position.set(0, -1.8, 0);
  faceGroup.add(mouthMesh);

  // Smiley Cheek Flushes (soft red/pink plates for cute Roblox look)
  const cheekGeom = new THREE.BoxGeometry(1.2, 0.8, 0.3);
  const cheekMat = new THREE.MeshBasicMaterial({ color: '#fca5a5' }); // coral red
  
  const cheekL = new THREE.Mesh(cheekGeom, cheekMat);
  cheekL.position.set(-3.5, -1, 0);
  faceGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeom, cheekMat);
  cheekR.position.set(3.5, -1, 0);
  faceGroup.add(cheekR);

  headGroup.add(faceGroup);

  // 4. Stylish Blocky Cap Accents (give the character more personality!)
  const capGroup = new THREE.Group();
  
  // Cap dome
  const capDomeGeom = new THREE.BoxGeometry(headSize + 0.8, 3, headSize + 0.8);
  const capMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 }); // bright red cap
  const capDome = new THREE.Mesh(capDomeGeom, capMat);
  capDome.position.y = headSize / 2 - 0.5;
  capDome.castShadow = true;
  capGroup.add(capDome);

  // Cap Visor/Bill (famous blocky cap front beak)
  const visorGeom = new THREE.BoxGeometry(headSize - 1, 0.5, 4);
  const visor = new THREE.Mesh(visorGeom, capMat);
  visor.position.set(0, headSize / 2 - 1.5, headSize / 2 + 1.5);
  visor.castShadow = true;
  capGroup.add(visor);

  headGroup.add(capGroup);

  return headGroup;
}
