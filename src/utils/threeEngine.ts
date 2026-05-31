import * as THREE from 'three';
import { PlayerData, OrbData } from '../types';
import { getStandableFloorState } from '../world';
import { buildRobloxCharacter } from './character/builder';
import { cheatState } from './cheatState';
import { buildObbyWorldMap } from './threeEngine/mapBuilder';
import { predictLocalPlayerPhysics } from './threeEngine/physics';

export class ThreeGameEngine {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  
  // Three.js Core
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  
  // Lights
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;
  
  // Cache of meshes
  private mapGroup!: THREE.Group;
  private playerMeshes: Record<string, THREE.Group> = {};
  private orbMeshes: Record<string, THREE.Mesh> = {};
  
  // Animation state
  private startTime = performance.now();
  private lastFrameTime = performance.now();
  private localPos = { x: 0, y: 0, z: 0, dz: 0 };
  private localPosInitialized = false;

  // Real-time bypass variables (keys, fling physics tracking)
  private keys: Record<string, boolean> = {};
  private onKeyDownBound: any;
  private onKeyUpBound: any;
  private flingOffsets: Record<string, { x: number; y: number; z: number; rx: number; ry: number; rz: number }> = {};
  
  constructor(container: HTMLDivElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;
    this.init();

    // Bind physical keyboard listeners to scan for Space, Shift or Control bypass overrides
    this.onKeyDownBound = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
    };
    this.onKeyUpBound = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
    };
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
  }

  private init() {
    // 1. Create Scene & Atmospheric background colors matching a beautiful sunny Voxel Pagoda Garden theme
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#9ccdf5');
    this.scene.fog = new THREE.FogExp2('#9ccdf5', 0.003);

    // 2. Setup Camera
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);

    // 3. Setup WebGL Renderer with High-Fidelity Soft Shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // 4. Setup Lighting
    this.ambientLight = new THREE.AmbientLight('#ffffff', 0.75); // bright neutral daylight ambient
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight('#fffaed', 1.8); // strong warm sun light
    this.dirLight.position.set(300, 600, 150);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048; // Increased resolution for sharp voxel shadows
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 1500;
    
    // Ambient box for mapping shadows over the active challenge zone
    const shadowR = 500;
    this.dirLight.shadow.camera.left = -shadowR;
    this.dirLight.shadow.camera.right = shadowR;
    this.dirLight.shadow.camera.top = shadowR;
    this.dirLight.shadow.camera.bottom = -shadowR;
    this.dirLight.shadow.bias = -0.0003;
    this.scene.add(this.dirLight);

    // Subtle atmospheric floor grid styled with soft day-sky pigments in the infinite void
    const gridHelper = new THREE.GridHelper(1000, 50, '#abd1ed', '#c7e2f5');
    gridHelper.position.y = -80; // deep down below
    this.scene.add(gridHelper);

    // 5. Build static map using our modular map builder
    this.buildMap();
  }

  // Create real 3D static block geometry once (excellent performance improvement, 0 delay)
  private buildMap() {
    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);
    buildObbyWorldMap(this.scene, this.mapGroup);
  }

  // Update position of players and gemstone items on state changes
  public updateState(
    players: Record<string, PlayerData>, 
    orbs: OrbData[], 
    username: string, 
    cameraState: { yaw: number, pitch: number, zoom: number },
    localInput?: { dx: number; dy: number; jump: boolean }
  ) {
    const now = performance.now();
    let dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    if (dt > 0.1) dt = 0.1; // Clamp lag spikes

    if (!cheatState.flingActive && Object.keys(this.flingOffsets).length > 0) {
      this.flingOffsets = {};
    }

    const time = (now - this.startTime) / 1000;

    // ---- A. DYNAMIC GEMSTONE CRYSTAL INTERACTION ----
    const currentOrbIds = new Set(orbs.map(o => o.id));
    
    // Hide or render existing 3D gems
    orbs.forEach(orb => {
      let gem = this.orbMeshes[orb.id];
      if (!gem) {
        // Construct a glowing octahedron gemstone mesh
        const geom = new THREE.OctahedronGeometry(6, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: orb.color || '#fbbf24',
          metalness: 0.1,
          roughness: 0.2,
          emissive: orb.color || '#fbbf24',
          emissiveIntensity: 0.7,
        });
        gem = new THREE.Mesh(geom, mat);
        this.scene.add(gem);
        this.orbMeshes[orb.id] = gem;
      }

      // Map positions: (X, Vertical Altitude height, Z)
      const floatY = Math.sin(time * 3 + orb.x * 0.1) * 3;
      gem.position.set(orb.x, orb.z + floatY + 6, orb.y);
      gem.rotation.y = time * 2;
      gem.rotation.x = time * 0.5;
      gem.visible = true;
    });

    // Strip uncollected/despawned gems from active scene objects
    Object.keys(this.orbMeshes).forEach(id => {
      if (!currentOrbIds.has(id)) {
        this.orbMeshes[id].visible = false;
      }
    });

    // ---- B. DYNAMIC ROBLOXIAN MULTIPLAYER AVATARS ----
    const activeUsernames = new Set(Object.keys(players));

    Object.entries(players).forEach(([pId, p]) => {
      let avatar = this.playerMeshes[pId];
      if (!avatar) {
        // Instantiate the polished, modular 3D Roblox character from our dedicated builder
        const group = buildRobloxCharacter(p.color || '#3b82f6');
        this.scene.add(group);
        this.playerMeshes[pId] = group;
        avatar = group;
      }

      let deltaX = 0;
      let deltaZ = 0;

      if (pId === username) {
        if (!this.localPosInitialized) {
          this.localPos.x = p.x;
          this.localPos.y = p.y;
          this.localPos.z = p.z;
          this.localPos.dz = 0;
          this.localPosInitialized = true;
        }

        // Apply local inputs for physics prediction using modular physics calculator
        if (localInput) {
          predictLocalPlayerPhysics(this.localPos, localInput, dt, this.keys);
        }

        // Direct sync back to the reference object p to ensure 100% agreement between rendering and hook state
        // Detect heavy external resets (like death respawn or victory lap reset)
        const extDist = Math.sqrt((this.localPos.x - p.x)**2 + (this.localPos.y - p.y)**2 + (this.localPos.z - p.z)**2);
        if (extDist > 180) {
          this.localPos.x = p.x;
          this.localPos.y = p.y;
          this.localPos.z = p.z;
          this.localPos.dz = p.dz || 0;
        } else {
          p.x = this.localPos.x;
          p.y = this.localPos.y;
          p.z = this.localPos.z;
          p.dz = this.localPos.dz;
        }

        deltaX = this.localPos.x - avatar.position.x;
        deltaZ = this.localPos.y - avatar.position.z;

        avatar.position.x = this.localPos.x;
        avatar.position.y = this.localPos.z;
        avatar.position.z = this.localPos.y;
      } else {
        // Evaluate Fling Force if near this remote player
        if (cheatState.flingActive) {
          const distToMe = Math.sqrt(
            (p.x - this.localPos.x) ** 2 +
            (p.y - this.localPos.y) ** 2 +
            (p.z - this.localPos.z) ** 2
          );

          if (distToMe < 35 && !this.flingOffsets[pId]) {
            // Apply client-side chaotic projection velocity
            this.flingOffsets[pId] = {
              x: (Math.random() - 0.5) * 600,
              y: 700 + Math.random() * 450,
              z: (Math.random() - 0.5) * 600,
              rx: 0,
              ry: 0,
              rz: 0
            };

            // Trigger local client notification logs in the exploit console terminal
            window.dispatchEvent(new CustomEvent('blox_cheat_log', {
              detail: `[FLING HACK SUCCESS] Lançando player ${p.username} com vetor de torque infinito!`
            }));
          }
        }

        const targetX = p.x;
        const targetY = p.z;
        const targetZ = p.y;

        const prevX = avatar.position.x;
        const prevZ = avatar.position.z;

        avatar.position.x += (targetX - avatar.position.x) * 0.45;
        avatar.position.y += (targetY - avatar.position.y) * 0.45;
        avatar.position.z += (targetZ - avatar.position.z) * 0.45;

        // Apply progressive integration translation if launched by a fling exploit
        const fo = this.flingOffsets[pId];
        if (fo) {
          fo.x += fo.x * dt * 0.5;
          fo.y += (fo.y - 1200 * dt) * dt; // gravity deceleration simulation
          fo.z += fo.z * dt * 0.5;
          
          fo.rx += 18 * dt;
          fo.ry += 24 * dt;
          fo.rz += 15 * dt;

          avatar.position.x += fo.x * dt;
          avatar.position.y += fo.y * dt;
          avatar.position.z += fo.z * dt;

          avatar.rotation.x = fo.rx;
          avatar.rotation.y = fo.ry;
          avatar.rotation.z = fo.rz;
        }

        deltaX = avatar.position.x - prevX;
        deltaZ = avatar.position.z - prevZ;
      }

      // Animate limb movements if player is moving
      const legL = avatar.getObjectByName('legL') as THREE.Mesh;
      const legR = avatar.getObjectByName('legR') as THREE.Mesh;
      const armL = avatar.getObjectByName('armL') as THREE.Mesh;
      const armR = avatar.getObjectByName('armR') as THREE.Mesh;

      const distMoving = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
      if (distMoving > 0.1) {
        // Dynamic stride rotation animation matching displacement velocity
        const swing = Math.sin(time * 16.0) * 0.65;
        if (legL) legL.rotation.x = swing;
        if (legR) legR.rotation.x = -swing;
        if (armL) armL.rotation.x = -swing * 0.8;
        if (armR) armR.rotation.x = swing * 0.8;

        if (pId === username && cheatState.flingActive) {
          avatar.rotation.y = time * 70; // Spin extremely fast as a visual indicator of tornado fling torque list
        } else if (this.flingOffsets[pId]) {
          // Handled by fling rotational offsets above to animate chaos rotation
        } else {
          // Turn torso to point towards movement vector direction
          const movingAngle = Math.atan2(deltaX, deltaZ);
          avatar.rotation.y = movingAngle;
        }
      } else {
        // Return limbs back to default clean standing positions smoothly
        if (legL) legL.rotation.x *= 0.82;
        if (legR) legR.rotation.x *= 0.82;
        if (armL) armL.rotation.x *= 0.82;
        if (armR) armR.rotation.x *= 0.82;

        if (pId === username && cheatState.flingActive) {
          avatar.rotation.y = time * 70;
        }
      }

      avatar.visible = true;
    });

    // Remove remote players when they disconnect from server state
    Object.keys(this.playerMeshes).forEach(pId => {
      if (!activeUsernames.has(pId)) {
        this.scene.remove(this.playerMeshes[pId]);
        delete this.playerMeshes[pId];
      }
    });

    // ---- C. HIGH-FIDELITY CAMERA TARGET ORBIT TRACKING ----
    const localPlayer = players[username] || Object.values(players)[0];
    if (localPlayer) {
      // Find where player is currently positioned
      const tx = avatarLerped(this.playerMeshes, username, localPlayer.x, 'x');
      const ty = avatarLerped(this.playerMeshes, username, localPlayer.z, 'y') + 12; // eye coordinate offset
      const tz = avatarLerped(this.playerMeshes, username, localPlayer.y, 'z');

      // Spherical trigonometric calculations for dynamic orbiting perspective
      const cosP = Math.cos(cameraState.pitch);
      const sinP = Math.sin(cameraState.pitch);

      const camX = tx + cameraState.zoom * cosP * Math.sin(cameraState.yaw);
      const camY = ty + cameraState.zoom * sinP;
      const camZ = tz + cameraState.zoom * cosP * Math.cos(cameraState.yaw);

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(tx, ty, tz);

      // Dyn-offset shadows directional lights so shader calculations remain sharp around active player
      this.dirLight.position.set(tx + 180, ty + 300, tz + 120);
      this.dirLight.target.position.set(tx, ty, tz);
      this.dirLight.target.updateMatrixWorld();
    }

    // Trigger standard WebGL render cycle
    this.renderer.render(this.scene, this.camera);
  }

  public setLocalPosition(x: number, y: number, z: number) {
    this.localPos.x = x;
    this.localPos.y = y;
    this.localPos.z = z;
    this.localPos.dz = 0;
    this.localPosInitialized = true;
  }

  public getLocalPos() {
    return {
      x: this.localPos.x,
      y: this.localPos.y,
      z: this.localPos.z,
      dz: this.localPos.dz,
    };
  }

  // Handle window resizing
  public handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Project vertical coordinates of 3D entities to 2D screen positions for pixel perfect HTML UI tags (names & badges)
  public getScreenCoordinates(pId: string): { x: number; y: number } | null {
    const mesh = this.playerMeshes[pId];
    if (!mesh || !mesh.visible) return null;

    // Head center point offset
    const worldPoint = new THREE.Vector3(mesh.position.x, mesh.position.y + 42, mesh.position.z);
    worldPoint.project(this.camera);

    // Filter points out behind camera
    if (worldPoint.z > 1) return null;

    const width = this.canvas.width;
    const height = this.canvas.height;

    const x = (worldPoint.x *  .5 + .5) * width;
    const y = (worldPoint.y * -.5 + .5) * height;

    return { x, y };
  }

  // Clean-up context allocation preventing WebGL context memory exceptions
  public dispose() {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.scene.clear();
    this.renderer.dispose();
  }
}

// Private helper to smooth nameplate projections matching lerped frame avatar speeds
function avatarLerped(meshes: Record<string, THREE.Group>, pId: string, serverVal: number, axis: 'x'|'y'|'z'): number {
  const m = meshes[pId];
  if (!m) return serverVal;
  return m.position[axis];
}
