import React, { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { PlayerData, OrbData, ChatMessage } from '../../types';
import { cheatState } from '../../utils/cheatState';

interface UseHTTPPollingProps {
  username: string;
  playersRef: MutableRefObject<Record<string, PlayerData & { inputDx: number; inputDy: number; inputJump: boolean }>>;
  setPlayers: (players: Record<string, PlayerData & { inputDx: number; inputDy: number; inputJump: boolean }>) => void;
  setOrbs: (orbs: OrbData[]) => void;
  setChats: Dispatch<SetStateAction<ChatMessage[]>>;
  setBanInfo: (banInfo: { reason: string; expiresAt: number } | null) => void;
  isPollingRef: MutableRefObject<boolean>;
  pendingActionRef: MutableRefObject<"died" | "win" | null>;
  pendingChatRef: MutableRefObject<string | null>;
  pendingOrbIdRef: MutableRefObject<string | null>;
  activeOrbsRef: MutableRefObject<OrbData[]>;
  triggerAlert: (type: "death" | "win" | "correction") => void;
  getPlayerColor: (name: string) => string;
}

export function useHTTPPolling({
  username,
  playersRef,
  setPlayers,
  setOrbs,
  setChats,
  setBanInfo,
  isPollingRef,
  pendingActionRef,
  pendingChatRef,
  pendingOrbIdRef,
  activeOrbsRef,
  triggerAlert,
  getPlayerColor,
}: UseHTTPPollingProps) {
  useEffect(() => {
    const handleHTTPPolling = async () => {
      if (!isPollingRef.current) return;

      const p = playersRef.current[username];
      const myColor = getPlayerColor(username);

      const payload = {
        username: username,
        color: myColor,
        pos: p
          ? {
              x: p.x,
              y: p.y,
              z: p.z,
              dx: p.inputDx,
              dy: p.inputDy,
              dz: p.dz,
              score: p.score,
            }
          : null,
        action: pendingActionRef.current,
        chatToSend: pendingChatRef.current,
        collectedOrbId: pendingOrbIdRef.current,
      };

      try {
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("API Sync Failed");

        const data = await response.json();

        if (data.banned) {
          setBanInfo({ reason: data.reason, expiresAt: data.expiresAt });
          isPollingRef.current = false;
          return;
        }

        // Clear successfully transmitted events
        pendingActionRef.current = null;
        pendingChatRef.current = null;
        pendingOrbIdRef.current = null;

        // Process HTTP State Sync
        if (data.correction) {
          const { x, y, z } = data.correction;
          window.dispatchEvent(
            new CustomEvent("engine_correction", { detail: { x, y, z } }),
          );
          if (playersRef.current[username]) {
            playersRef.current[username].x = x;
            playersRef.current[username].y = y;
            playersRef.current[username].z = z;
            playersRef.current[username].dz = 0;
          }
          triggerAlert("correction");
        }

        const serverPlayers = data.players;
        const currentMyState = playersRef.current[username];
        const updated: Record<
          string,
          PlayerData & { inputDx: number; inputDy: number; inputJump: boolean }
        > = {};

        Object.entries(serverPlayers).forEach(([pId, pDataAny]) => {
          const p = pDataAny as PlayerData;
          // Client-side local ban feature filter
          if (cheatState.kickedPlayers[p.username]) {
            return; // Exclude entirely!
          }

          if (pId === username) {
            updated[pId] = {
              ...p,
              x: currentMyState ? currentMyState.x : p.x,
              y: currentMyState ? currentMyState.y : p.y,
              z: currentMyState ? currentMyState.z : p.z,
              dz: currentMyState ? currentMyState.dz : p.dz,
              inputDx: currentMyState ? currentMyState.inputDx : 0,
              inputDy: currentMyState ? currentMyState.inputDy : 0,
              inputJump: currentMyState ? currentMyState.inputJump : false,
            };
          } else {
            updated[pId] = {
              ...p,
              inputDx: p.dx || 0,
              inputDy: p.dy || 0,
              inputJump: false,
            };
          }
        });

        playersRef.current = updated;
        setPlayers(updated);

        // Sync Orbs
        activeOrbsRef.current = data.orbs;
        setOrbs(data.orbs);

        // Sync Chats safely preserving chronological order and omitting duplicates
        if (data.chats && data.chats.length > 0) {
          setChats((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const fresh = data.chats.filter((c: any) => !existingIds.has(c.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...fresh].slice(-50);
          });
        }
      } catch (err) {
        console.error("[HTTP SYNC ERROR]:", err);
      }
    };

    const pollTimer = setInterval(handleHTTPPolling, 120);
    return () => clearInterval(pollTimer);
  }, [username, setPlayers, setOrbs, setChats, setBanInfo, getPlayerColor, triggerAlert, isPollingRef, activeOrbsRef, pendingActionRef, pendingChatRef, pendingOrbIdRef, playersRef]);
}
