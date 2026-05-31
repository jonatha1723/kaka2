import * as THREE from 'three';
import { createHead } from './head';
import { createTorso } from './torso';
import { createArm, createLeg } from './limbs';

export function buildRobloxCharacter(primaryColor: string = '#3b82f6'): THREE.Group {
  const characterGroup = new THREE.Group();
  characterGroup.name = 'roblox_character';

  // 1. Torso Assembly (Center at y = 18 relative to local avatar master pivot)
  const torso = createTorso(primaryColor);
  torso.position.set(0, 18, 0);
  characterGroup.add(torso);

  // 2. Head Assembly (Center at y = 33.5 relative to master pivot)
  const head = createHead('#ffdbac');
  // Name head assembly so any search for nameplates targeting the 'head' finds it
  head.name = 'head'; 
  head.position.set(0, 33.5, 0);
  characterGroup.add(head);

  // 3. Left Leg (Hip Pivot at y = 10, offset horizontally to x = -4)
  const legL = createLeg(false, '#1e293b');
  legL.position.set(-4, 10, 0);
  characterGroup.add(legL);

  // 4. Right Leg (Hip Pivot at y = 10, offset horizontally to x = 4)
  const legR = createLeg(true, '#1e293b');
  legR.position.set(4, 10, 0);
  characterGroup.add(legR);

  // 5. Left Arm (Shoulder Pivot at y = 27, offset horizontally to x = -10.5)
  const armL = createArm(false, '#ffdbac', primaryColor);
  armL.position.set(-10.5, 27, 0);
  characterGroup.add(armL);

  // 6. Right Arm (Shoulder Pivot at y = 27, offset horizontally to x = 10.5)
  const armR = createArm(true, '#ffdbac', primaryColor);
  armR.position.set(10.5, 27, 0);
  characterGroup.add(armR);

  // Apply shadow casting/receiving capabilities across all sub-meshes recursively
  characterGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return characterGroup;
}
