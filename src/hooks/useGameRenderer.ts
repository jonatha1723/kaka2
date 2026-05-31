import React, { useEffect, useRef } from 'react';
import { ThreeGameEngine } from '../utils/threeEngine';

export function useGameRenderer(
  loading: boolean,
  disconnected: boolean,
  containerRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  labelContainerRef: React.RefObject<HTMLDivElement>,
  playersRef: React.MutableRefObject<any>,
  orbsRef: React.MutableRefObject<any>,
  usernameRef: React.MutableRefObject<string>,
  cameraRef: React.MutableRefObject<any>,
  keysRef: React.MutableRefObject<any>,
  analogInputRef: React.MutableRefObject<any>,
  updateLocalPlayerPosition: (x: number, y: number, z: number, dz: number) => void
) {
  const labelsRef = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    if (loading || disconnected) return;
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const engine = new ThreeGameEngine(containerRef.current, canvas);

    let animFrame: number;
    const render = () => {
      let dx = 0, dy = 0;
      if (keysRef.current["w"] || keysRef.current["z"] || keysRef.current["arrowup"]) dy -= 1;
      if (keysRef.current["s"] || keysRef.current["arrowdown"]) dy += 1;
      if (keysRef.current["a"] || keysRef.current["q"] || keysRef.current["arrowleft"]) dx -= 1;
      if (keysRef.current["d"] || keysRef.current["arrowright"]) dx += 1;
      if (analogInputRef.current.dx !== 0 || analogInputRef.current.dy !== 0) { dx = analogInputRef.current.dx; dy = analogInputRef.current.dy; }

      let fDx = 0, fDy = 0;
      if (dx !== 0 || dy !== 0) {
        const yaw = cameraRef.current.yaw;
        const mag = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const nDx = dx / (Math.sqrt(dx * dx + dy * dy) || 1);
        const nDy = dy / (Math.sqrt(dx * dx + dy * dy) || 1);
        fDx = (nDx * Math.cos(yaw) + nDy * Math.sin(yaw)) * mag;
        fDy = (-nDx * Math.sin(yaw) + nDy * Math.cos(yaw)) * mag;
      }

      engine.updateState(playersRef.current, orbsRef.current, usernameRef.current, cameraRef.current, { dx: fDx, dy: fDy, jump: analogInputRef.current.jump });
      const pos = engine.getLocalPos();
      updateLocalPlayerPosition(pos.x, pos.y, pos.z, pos.dz);

      const labelContainer = labelContainerRef.current;
      if (labelContainer) {
        const curPlayers = playersRef.current;
        Object.keys(labelsRef.current).forEach(id => {
          if (!curPlayers[id]) {
            const el = labelsRef.current[id];
            if (el?.parentNode) el.parentNode.removeChild(el);
            delete labelsRef.current[id];
          }
        });
        Object.entries(curPlayers).forEach(([id, p]: [string, any]) => {
          let el = labelsRef.current[id];
          if (!el) {
            el = document.createElement("div");
            el.className = "absolute pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center justify-center transition-opacity duration-150 select-none";
            const n = document.createElement("div");
            n.className = `px-2 py-0.5 rounded shadow text-[10px] font-black border ${id === usernameRef.current ? "bg-blue-600 text-white border-blue-400" : "bg-black/80 text-white border-white/10"}`;
            n.id = `n-${id}`;
            el.appendChild(n);
            labelContainer.appendChild(el);
            labelsRef.current[id] = el;
          }
          const c = engine.getScreenCoordinates(id);
          if (c) { el.style.left = `${c.x}px`; el.style.top = `${c.y}px`; el.style.opacity = "1"; const n = el.firstChild; if (n) (n as HTMLDivElement).textContent = p.username; } else { el.style.opacity = "0"; }
        });
      }
      animFrame = requestAnimationFrame(render);
    };
    animFrame = requestAnimationFrame(render);
    const hResize = () => engine.handleResize();
    window.addEventListener("resize", hResize);
    const hCorrection = (e: any) => { if (e.detail) engine.setLocalPosition(e.detail.x, e.detail.y, e.detail.z); };
    window.addEventListener("engine_correction", hCorrection);
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener("resize", hResize); window.removeEventListener("engine_correction", hCorrection); engine.dispose(); if (labelContainerRef.current) labelContainerRef.current.innerHTML = ""; labelsRef.current = {}; };
  }, [loading, disconnected, containerRef, canvasRef, labelContainerRef, playersRef, orbsRef, usernameRef, cameraRef, keysRef, analogInputRef, updateLocalPlayerPosition]);
}
