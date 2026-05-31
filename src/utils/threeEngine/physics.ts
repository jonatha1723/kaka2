import { getStandableFloorState, getBlockingWallHeight } from '../../world';
import { WORLD_SIZE, TILE_SIZE } from '../../constants';
import { GRID_SIZE, VOXEL_SIZE } from '../../world/voxelMap';
import { cheatState } from '../cheatState';

interface LocalPosition {
  x: number;
  y: number;
  z: number;
  dz: number;
}

interface LocalInput {
  dx: number;
  dy: number;
  jump: boolean;
}

// Predicts local player physics update based on client input and delta-time
export function predictLocalPlayerPhysics(
  localPos: LocalPosition,
  localInput: LocalInput,
  dt: number,
  keys: Record<string, boolean>
) {
  const localSpeed = 248 * (cheatState.speedMultiplier || 1.0); // Bypassed Roblox custom walkspeed!
  const nx = localPos.x + (localInput.dx * localSpeed * dt);
  const ny = localPos.y + (localInput.dy * localSpeed * dt);

  // Verify bounds and brick structure collisions
  const rad = 10;
  
  let hitWall = false;
  if (!cheatState.noclipEnabled) {
    const obstacleHeight = getBlockingWallHeight(nx, ny, rad);
    // If obstacle is higher than our feet + step height
    if (obstacleHeight > localPos.z + 8.5) {
      hitWall = true;
    }
  }

  if (!hitWall) {
    localPos.x = nx;
    localPos.y = ny;
  }

  // Floor height lookup
  const { floorHeight } = getStandableFloorState(localPos.x, localPos.y, localPos.z, 14);

  if (cheatState.flyEnabled) {
    // FLY HACK ACTIVE: Bypasses standard gravitational constraints entirely
    localPos.dz = 0;
    if (keys[' '] || localInput.jump) {
      localPos.z += 320 * dt; // Hold SPACE to fly up
    }
    if (keys['shift'] || keys['control']) {
      localPos.z -= 320 * dt; // Hold Left Shift / Control to slide downwards
    }
    // Ambient soft floor safety bounds
    localPos.z = Math.max(-120, Math.min(340, localPos.z));
  } else {
    // Standard Roblox gravitational simulation
    // Jump velocity trigger
    if (localInput.jump && localPos.dz === 0) {
      if (Math.abs(localPos.z - floorHeight) < 1.5) {
        localPos.dz = 480; // units/sec jump velocity matching 12 units * 40 ticks/sec
      }
    }

    // Gravity accumulation
    if (localPos.z > floorHeight || localPos.dz !== 0) {
      localPos.z += localPos.dz * dt;
      localPos.dz -= 1280 * dt; // gravity constant matches 0.8 units * 40 * 40 ticks/sec^2
      if (localPos.dz <= 0 && localPos.z <= floorHeight) {
        localPos.z = floorHeight;
        localPos.dz = 0;
      }
    } else {
      localPos.z = floorHeight;
      localPos.dz = 0;
    }
  }
}

