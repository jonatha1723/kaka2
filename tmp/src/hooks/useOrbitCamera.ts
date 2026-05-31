import React, { useRef, useCallback } from 'react';

export function useOrbitCamera() {
  const cameraRef = useRef({
    yaw: 0.7,
    pitch: 0.65,
    zoom: 240,
  });

  const dragRef = useRef({ isDragging: false, lx: 0, ly: 0 });

  const handlePointerDown = (e: React.PointerEvent, canvas: HTMLCanvasElement | null) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.focus();

    dragRef.current.isDragging = true;
    dragRef.current.lx = e.clientX;
    dragRef.current.ly = e.clientY;

    if (canvas) canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.lx;
    const dy = e.clientY - dragRef.current.ly;

    if (isNaN(dx) || isNaN(dy)) return;

    const sensYaw = e.pointerType === "touch" ? 0.007 : 0.005;
    const sensPitch = e.pointerType === "touch" ? 0.006 : 0.004;

    cameraRef.current.yaw -= dx * sensYaw;
    cameraRef.current.pitch = Math.max(0.08, Math.min(1.35, cameraRef.current.pitch + dy * sensPitch));

    dragRef.current.lx = e.clientX;
    dragRef.current.ly = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent, canvas: HTMLCanvasElement | null) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      if (canvas) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraRef.current.zoom = Math.max(120, Math.min(450, cameraRef.current.zoom + e.deltaY * 0.35));
  };

  return { cameraRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel };
}
