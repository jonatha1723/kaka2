import React, { useRef, useCallback, useEffect } from 'react';

export function useGameInput(sendInput: (dx: number, dy: number, jump: boolean) => void, cameraRef: React.MutableRefObject<{ yaw: number }>) {
  const keysRef = useRef<Record<string, boolean>>({});
  const analogInputRef = useRef({ dx: 0, dy: 0, jump: false });
  const lastInputsRef = useRef({ dx: 0, dy: 0, jump: false });

  const syncInputsWithServer = useCallback(
    (force = false) => {
      let dx = 0;
      let dy = 0;

      if (keysRef.current["w"] || keysRef.current["z"] || keysRef.current["arrowup"]) dy -= 1;
      if (keysRef.current["s"] || keysRef.current["arrowdown"]) dy += 1;
      if (keysRef.current["a"] || keysRef.current["q"] || keysRef.current["arrowleft"]) dx -= 1;
      if (keysRef.current["d"] || keysRef.current["arrowright"]) dx += 1;

      if (analogInputRef.current.dx !== 0 || analogInputRef.current.dy !== 0) {
        dx = analogInputRef.current.dx;
        dy = analogInputRef.current.dy;
      }

      let finalDx = 0;
      let finalDy = 0;
      const jumpTrigger = analogInputRef.current.jump;

      if (dx !== 0 || dy !== 0) {
        const yaw = cameraRef.current.yaw;
        const mag = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const normDx = dx / (Math.sqrt(dx * dx + dy * dy) || 1);
        const normDy = dy / (Math.sqrt(dx * dx + dy * dy) || 1);

        finalDx = (normDx * Math.cos(yaw) + normDy * Math.sin(yaw)) * mag;
        finalDy = (-normDx * Math.sin(yaw) + normDy * Math.cos(yaw)) * mag;
      }

      if (Math.abs(finalDx) < 0.002) finalDx = 0;
      if (Math.abs(finalDy) < 0.002) finalDy = 0;

      const changed =
        Math.abs(lastInputsRef.current.dx - finalDx) > 0.001 ||
        Math.abs(lastInputsRef.current.dy - finalDy) > 0.001 ||
        lastInputsRef.current.jump !== jumpTrigger;

      if (changed || force) {
        sendInput(finalDx, finalDy, jumpTrigger);
        lastInputsRef.current = { dx: finalDx, dy: finalDy, jump: jumpTrigger };
      }
    },
    [sendInput, cameraRef],
  );

  return { keysRef, analogInputRef, syncInputsWithServer };
}
