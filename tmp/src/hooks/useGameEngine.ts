import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerData, OrbData, ChatMessage, WSMessage } from "../types";
import { cheatState } from "../utils/cheatState";
import { useHTTPPolling } from "./useGameEngine/useHTTPPolling";
import { usePhysicsTick } from "./useGameEngine/usePhysicsTick";

export function useGameEngine(username: string) {
  const [players, setPlayers] = useState<Record<string, PlayerData>>({});
  const [orbs, setOrbs] = useState<OrbData[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnected, setDisconnected] = useState(false);
  const [alerts, setAlerts] = useState<{ type: "death" | "win" | "correction"; id: number }[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [banInfo, setBanInfo] = useState<{ reason: string; expiresAt: number } | null>(null);

  const playersRef = useRef<Record<string, PlayerData & { inputDx: number; inputDy: number; inputJump: boolean }>>({});
  const activeOrbsRef = useRef<OrbData[]>([]);
  const collectedOrbsRef = useRef<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const isPollingRef = useRef<boolean>(false);
  const pendingChatRef = useRef<string | null>(null);
  const pendingActionRef = useRef<"died" | "win" | null>(null);
  const pendingOrbIdRef = useRef<string | null>(null);

  const getPlayerColor = useCallback((name: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316"];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const addChatMessage = useCallback((sender: string, text: string, color: string) => {
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setChats((prev) => [...prev.slice(-49), { id: String(Date.now() + Math.random()), username: sender, text, time: timeStr, color }]);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setChats((prev) => [...prev.slice(-49), { id: String(Date.now() + Math.random()), username: "[SISTEMA]", text, time: timeStr, color: "#10b981" }]);
  }, []);

  const triggerAlert = useCallback((type: "death" | "win" | "correction") => {
    const id = Date.now();
    setAlerts((prev) => [...prev.filter((a) => a.type !== type), { type, id }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), type === "death" ? 2000 : 4000);
  }, []);

  const updateLocalPlayerPosition = useCallback((x: number, y: number, z: number, dz: number) => {
    const p = playersRef.current[username];
    if (p) { p.x = x; p.y = y; p.z = z; p.dz = dz; }
  }, [username]);

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    setLoading(true); setDisconnected(false);
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    const wsTimeout = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) { isPollingRef.current = true; setLoading(false); }
    }, 2500);

    socket.onopen = () => {
      clearTimeout(wsTimeout);
      isPollingRef.current = false; setDisconnected(false); setLoading(false);
      socket.send(JSON.stringify({ type: "join", username, color: getPlayerColor(username) }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        switch (msg.type) {
          case "state": {
            const serverPlayers = msg.players;
            const currentMyState = playersRef.current[username];
            const updated: Record<string, PlayerData & { inputDx: number; inputDy: number; inputJump: boolean }> = {};
            Object.entries(serverPlayers).forEach(([pId, p]) => {
              if (cheatState.kickedPlayers[p.username]) return;
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
                updated[pId] = { ...p, inputDx: p.dx || 0, inputDy: p.dy || 0, inputJump: false };
              }
            });
            playersRef.current = updated; setPlayers(updated);
            activeOrbsRef.current = msg.orbs; setOrbs(msg.orbs);
            break;
          }
          case "correction": {
            if (msg.pos) {
              const { x, y, z } = msg.pos;
              window.dispatchEvent(new CustomEvent("engine_correction", { detail: { x, y, z } }));
              if (playersRef.current[username]) {
                playersRef.current[username].x = x; playersRef.current[username].y = y; playersRef.current[username].z = z; playersRef.current[username].dz = 0;
              }
              triggerAlert("correction");
            }
            break;
          }
          case "banned": { setBanInfo({ reason: msg.reason, expiresAt: msg.expiresAt }); socket.close(); break; }
          case "chat": { addChatMessage(msg.username, msg.text, msg.color || "#fff"); break; }
          case "system_msg": { addSystemMessage(msg.text); break; }
          case "orb_collected": {
            collectedOrbsRef.current[msg.orbId] = true;
            const user = playersRef.current[msg.username];
            if (user) { user.score = msg.score; setPlayers({ ...playersRef.current }); }
            break;
          }
        }
      } catch (err) {
        console.error("[WS] Message parsing error:", err);
      }
    };

    socket.onclose = () => {
      clearTimeout(wsTimeout);
      isPollingRef.current = true; setLoading(false); setDisconnected(false);
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isPollingRef.current) {
          const silentSocket = new WebSocket(wsUrl);
          silentSocket.onopen = () => { silentSocket.close(); connect(); };
        }
      }, 8000);
    };
    socket.onerror = () => socket.close();
  }, [username, addChatMessage, addSystemMessage, getPlayerColor, triggerAlert]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  useHTTPPolling({ username, playersRef, setPlayers, setOrbs, setChats, setBanInfo, isPollingRef, pendingActionRef, pendingChatRef, pendingOrbIdRef, activeOrbsRef, triggerAlert, getPlayerColor });
  usePhysicsTick({ loading, username, playersRef, activeOrbsRef, collectedOrbsRef, isPollingRef, wsRef, pendingActionRef, pendingOrbIdRef, triggerAlert });

  const sendInput = useCallback((dx: number, dy: number, jump: boolean) => {
    const userState = playersRef.current[username];
    if (userState) { userState.inputDx = dx; userState.inputDy = dy; userState.inputJump = jump; }
  }, [username]);

  const sendChatMessage = useCallback((text: string) => {
    const trimmed = text.trim().substring(0, 80);
    if (!trimmed) return;
    if (!isPollingRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", username, text: trimmed }));
    } else {
      pendingChatRef.current = trimmed;
    }
  }, [username]);

  return { players, orbs, loading, disconnected, alerts, chats, banInfo, sendInput, sendChatMessage, reconnect: connect, updateLocalPlayerPosition };
}
