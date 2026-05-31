import React, { useEffect, MutableRefObject } from 'react';
import { PlayerData, OrbData } from '../../types';
import { getStandableFloorState, isHazardTile } from '../../world';
import { getSpawnParams } from '../../constants';
import { cheatState } from '../../utils/cheatState';

interface UsePhysicsTickProps {
  loading: boolean;
  username: string;
  playersRef: MutableRefObject<Record<string, PlayerData & { inputDx: number; inputDy: number; inputKeepAlive?: boolean; inputJump: boolean }>>;
  activeOrbsRef: MutableRefObject<OrbData[]>;
  collectedOrbsRef: MutableRefObject<Record<string, boolean>>;
  isPollingRef: MutableRefObject<boolean>;
  wsRef: MutableRefObject<WebSocket | null>;
  pendingActionRef: MutableRefObject<"died" | "win" | null>;
  pendingOrbIdRef: MutableRefObject<string | null>;
  triggerAlert: (type: "death" | "win" | "correction") => void;
}

export function usePhysicsTick({
  loading,
  username,
  playersRef,
  activeOrbsRef,
  collectedOrbsRef,
  isPollingRef,
  wsRef,
  pendingActionRef,
  pendingOrbIdRef,
  triggerAlert,
}: UsePhysicsTickProps) {
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      const p = playersRef.current[username];
      if (!p) return;

      const { floorHeight, tileType } = getStandableFloorState(
        p.x,
        p.y,
        p.z,
        14,
      );

      // 1. Check Environmental Deaths (Lava hazards or victory pads)
      if (p.z <= floorHeight + 2) {
        if (isHazardTile(tileType)) {
          // Red Hot Lava or Sky Lava
          if (!cheatState.godModeEnabled) {
            const spawn = getSpawnParams();
            p.x = spawn.x;
            p.y = spawn.y;
            p.z = spawn.z;
            p.dz = 0;
            p.inputDx = 0;
            p.inputDy = 0;
            p.inputJump = false;

            triggerAlert("death");
            if (
              !isPollingRef.current &&
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              wsRef.current.send(JSON.stringify({ type: "died" }));
            } else {
              pendingActionRef.current = "died";
            }
          }
        } else if (tileType === 6) {
          // Winner platform reach! (Podium)
          const spawn = getSpawnParams();
          p.x = spawn.x;
          p.y = spawn.y;
          p.z = spawn.z;
          p.dz = 0;
          p.inputDx = 0;
          p.inputDy = 0;
          p.inputJump = false;

          triggerAlert("win");
          if (
            !isPollingRef.current &&
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
          ) {
            wsRef.current.send(JSON.stringify({ type: "win" }));
          } else {
            pendingActionRef.current = "win";
          }
        }
      }

      // 2. Falling down into infinite cosmic void
      if (p.z < -130) {
        if (!cheatState.godModeEnabled) {
          const spawn = getSpawnParams();
          p.x = spawn.x;
          p.y = spawn.y;
          p.z = spawn.z;
          p.dz = 0;
          p.inputDx = 0;
          p.inputDy = 0;
          p.inputJump = false;

          triggerAlert("death");
          if (
            !isPollingRef.current &&
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
          ) {
            wsRef.current.send(JSON.stringify({ type: "died" }));
          } else {
            pendingActionRef.current = "died";
          }
        }
      }

      // 3. Gemstones overlap checking
      activeOrbsRef.current.forEach((orb) => {
        if (!collectedOrbsRef.current[orb.id]) {
          const dx = p.x - orb.x;
          const dy = p.y - orb.y;
          const dz = p.z - orb.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist <= 24) {
            collectedOrbsRef.current[orb.id] = true;
            if (
              !isPollingRef.current &&
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              wsRef.current.send(
                JSON.stringify({
                  type: "orb_collected",
                  orbId: orb.id,
                  username,
                  score: p.score,
                }),
              );
            } else {
              pendingOrbIdRef.current = orb.id;
            }
          }
        }
      });

      // 4. Periodically broadcast current positions (only when websocket path is perfectly active)
      if (
        !isPollingRef.current &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(
          JSON.stringify({
            type: "pos",
            x: p.x,
            y: p.y,
            z: p.z,
            dx: p.inputDx,
            dy: p.inputDy,
            dz: p.dz,
            score: p.score,
          }),
        );
      }
    }, 40);

    return () => clearInterval(interval);
  }, [loading, username, triggerAlert, playersRef, activeOrbsRef, collectedOrbsRef, isPollingRef, wsRef, pendingActionRef, pendingOrbIdRef]);
}
