import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface GameControlsProps {
  onInput: (dx: number, dy: number, jump: boolean) => void;
  onActiveInput: React.MutableRefObject<{ dx: number; dy: number; jump: boolean }>;
}

export default function Controls({ onInput, onActiveInput }: GameControlsProps) {
  const [dragging, setDragging] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTouchIdRef = useRef<number | null>(null);

  const JOYSTICK_RADIUS = 35; // Maximum displacement radius for the joystick nub

  // Process dragging coordinate calculation
  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      setStickPos({ x: 0, y: 0 });
      onActiveInput.current.dx = 0;
      onActiveInput.current.dy = 0;
      return;
    }

    const angle = Math.atan2(dy, dx);
    const cappedDistance = Math.min(distance, JOYSTICK_RADIUS);

    const nx = Math.cos(angle) * cappedDistance;
    const ny = Math.sin(angle) * cappedDistance;

    setStickPos({ x: nx, y: ny });

    // Normalize output vector (-1.0 to 1.0)
    const normalizedX = nx / JOYSTICK_RADIUS;
    const normalizedY = ny / JOYSTICK_RADIUS;

    onActiveInput.current.dx = normalizedX;
    onActiveInput.current.dy = normalizedY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    setDragging(true);
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!dragging || activeTouchIdRef.current === null) return;
    
    // Encontra o toque que originou a movimentação do joystick pelo ID do toque
    const touchesList = Array.from(e.touches) as any[];
    const touch = touchesList.find((t) => t.identifier === activeTouchIdRef.current);
    if (touch) {
      handleMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current === null) return;

    const touchesList = Array.from(e.changedTouches) as any[];
    const touch = touchesList.find((t) => t.identifier === activeTouchIdRef.current);
    if (touch || e.touches.length === 0) {
      setDragging(false);
      activeTouchIdRef.current = null;
      setStickPos({ x: 0, y: 0 });
      onActiveInput.current.dx = 0;
      onActiveInput.current.dy = 0;
    }
  };

  // Mouse fallback for responsive desk-testing of the mobile layout
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragging) handleMove(e.clientX, e.clientY);
    };
    const handleGlobalMouseUp = () => {
      if (dragging) {
        setDragging(false);
        setStickPos({ x: 0, y: 0 });
        onActiveInput.current.dx = 0;
        onActiveInput.current.dy = 0;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragging]);

  const handleJumpPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onActiveInput.current.jump = true;
    // Release trigger after small tick timeout to prevent duplicate jumps
    setTimeout(() => {
      onActiveInput.current.jump = false;
    }, 120);
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 z-40 px-6 pointer-events-none flex items-center justify-between">
      {/* 1. Left aligned: Visual Virtual Analog Joystick */}
      <div className="pointer-events-auto flex flex-col items-center select-none">
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className="w-20 h-20 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center relative touch-none cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          {/* Inner Joystick boundary core ring */}
          <div className="w-10 h-10 border border-white/5 rounded-full absolute pointer-events-none" />
          
          {/* Joystick Dynamic Handle/Thumb block */}
          <div
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
              transition: dragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center absolute pointer-events-none transition-shadow ${
              dragging 
                ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                : 'bg-neutral-800 border-neutral-700'
            }`}
          />
        </div>
        <span className="text-[9px] text-neutral-500 mt-1 select-none pointer-events-none font-medium tracking-wider">
          ANALÓGICO
        </span>
      </div>

      {/* 2. Right aligned: Big Shiny Jump Button */}
      <div className="pointer-events-auto flex flex-col items-center select-none">
        <button
          onTouchStart={handleJumpPress}
          onMouseDown={handleJumpPress}
          className="w-16 h-16 bg-blue-600/80 hover:bg-blue-500/90 active:bg-blue-700 border border-blue-400/20 rounded-full flex flex-col items-center justify-center text-white font-black font-sans uppercase text-xs shadow-[0_4px_15px_rgba(59,130,246,0.35)] transition-all active:scale-90 cursor-pointer"
        >
          <ArrowUp size={20} className="mb-0.5 animate-bounce" />
          Jump
        </button>
        <span className="text-[9px] text-neutral-500 mt-1 select-none pointer-events-none font-medium tracking-wider">
          PULAR [ESPAÇO]
        </span>
      </div>
    </div>
  );
}
