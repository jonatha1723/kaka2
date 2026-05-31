import { WebSocketServer, WebSocket } from "ws";
import { WSMessage, PlayerData } from "../types";
import { activePlayers, collectedOrbsState, activeOrbs, addGlobalChat } from "./dbState";
import { getSpawnParams } from "../constants";
import {
  verifyPlayerPosition,
  removeAcState,
  resetAcState,
  isBanned,
  banPlayer,
} from "./anticheat";

// Utility to broadcast to all open sockets
export function broadcast(wss: WebSocketServer, message: WSMessage) {
  const raw = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  });
}

// Main logic for handling custom WebSocket events inside the connection callback
export function handleWsConnection(ws: WebSocket & { username?: string }, wss: WebSocketServer) {
  console.log("[WS] Nova conexão estabelecida");

  ws.on("message", (messageRaw: string) => {
    try {
      const msg = JSON.parse(messageRaw) as WSMessage;

      switch (msg.type) {
        case "join": {
          const username = msg.username.trim().substring(0, 15);
          if (!username) return;

          const ban = isBanned(username);
          if (ban) {
            ws.send(
              JSON.stringify({
                type: "banned",
                reason: ban.reason,
                expiresAt: ban.expiresAt,
              }),
            );
            ws.close();
            return;
          }

          ws.username = username;
          const spawn = getSpawnParams();
          resetAcState(username, spawn.x, spawn.y, spawn.z);

          // Set up player in game list
          activePlayers[username] = {
            id: username,
            username: username,
            x: spawn.x + (Math.random() - 0.5) * 10,
            y: spawn.y + (Math.random() - 0.5) * 10,
            z: spawn.z,
            dx: 0,
            dy: 0,
            dz: 0,
            color: msg.color || "#3b82f6",
            score: 0,
            lastSeen: Date.now(),
          };

          console.log(
            `[JOIN] ${username} entrou com cor ${activePlayers[username].color}`,
          );
          addGlobalChat(
            "[SISTEMA]",
            `🟢 ${username} entrou no servidor!`,
            "#10b981",
          );

          // Send full initial game state immediately to this newly joined player
          const stateMessage: WSMessage = {
            type: "state",
            players: { ...activePlayers },
            orbs: activeOrbs.filter((o) => !collectedOrbsState[o.id]),
          };
          ws.send(JSON.stringify(stateMessage));

          // Notify everyone else that they joined
          broadcast(wss, {
            type: "system_msg",
            text: `🟢 ${username} entrou no servidor!`,
          });
          break;
        }

        case "pos": {
          if (!ws.username || !activePlayers[ws.username]) return;
          const p = activePlayers[ws.username];

          const currentPos = { x: p.x, y: p.y, z: p.z };
          const newPos = {
            x: msg.x,
            y: msg.y,
            z: msg.z,
            dx: msg.dx,
            dy: msg.dy,
            dz: msg.dz,
          };

          const acResult = verifyPlayerPosition(
            ws.username,
            currentPos,
            newPos,
          );

          if (!acResult.valid) {
            if (acResult.ban) {
              banPlayer(
                ws.username,
                acResult.ban.reason,
                acResult.ban.durationMs,
              );
              ws.send(
                JSON.stringify({
                  type: "banned",
                  reason: acResult.ban.reason,
                  expiresAt: Date.now() + acResult.ban.durationMs,
                }),
              );
              ws.close();
              delete activePlayers[ws.username];
              return;
            } else if (acResult.forceKill) {
              const spawn = getSpawnParams();
              p.x = spawn.x;
              p.y = spawn.y;
              p.z = spawn.z;
              p.dz = 0;
              p.dx = 0;
              p.dy = 0;
              resetAcState(ws.username, spawn.x, spawn.y, spawn.z);

              // Force sync to client
              ws.send(
                JSON.stringify({
                  type: "correction",
                  pos: { x: spawn.x, y: spawn.y, z: spawn.z },
                }),
              );
              ws.send(
                JSON.stringify({
                  type: "state",
                  players: { ...activePlayers },
                  orbs: [],
                }),
              );
              console.log(
                `[ANTICHEAT] ${ws.username} GodMode/Void death evited detectado. Morto forcado.`,
              );
            } else if (acResult.correctionPos) {
              p.x = acResult.correctionPos.x;
              p.y = acResult.correctionPos.y;
              p.z = acResult.correctionPos.z;
              p.dx = 0;
              p.dy = 0;
              p.dz = 0;

              // Force sync rubberband
              ws.send(
                JSON.stringify({
                  type: "correction",
                  pos: acResult.correctionPos,
                }),
              );
              ws.send(
                JSON.stringify({
                  type: "state",
                  players: { ...activePlayers },
                  orbs: [],
                }),
              );
              console.log(
                `[ANTICHEAT] ${ws.username} hack movimento: rubberband.`,
              );
            }
            p.lastSeen = Date.now();
            return;
          }

          p.x = msg.x;
          p.y = msg.y;
          p.z = msg.z;
          p.dx = msg.dx;
          p.dy = msg.dy;
          p.dz = msg.dz;
          p.score = msg.score;
          p.lastSeen = Date.now();
          break;
        }

        case "chat": {
          if (!ws.username) return;
          const sender = ws.username;
          const playerColor = activePlayers[sender]?.color || "#ffffff";

          console.log(`[CHAT] ${sender}: ${msg.text}`);
          addGlobalChat(sender, msg.text, playerColor);

          // Broadcast the chat message to everyone
          broadcast(wss, {
            type: "chat",
            username: sender,
            text: msg.text,
            color: playerColor,
          });
          break;
        }

        case "died": {
          if (!ws.username || !activePlayers[ws.username]) return;
          const p = activePlayers[ws.username];
          const spawn = getSpawnParams();
          p.x = spawn.x;
          p.y = spawn.y;
          p.z = spawn.z;
          p.dz = 0;
          p.dx = 0;
          p.dy = 0;
          p.lastSeen = Date.now();
          resetAcState(ws.username, spawn.x, spawn.y, spawn.z);

          addGlobalChat(
            "[SISTEMA]",
            `🔥 ${ws.username} morreu na lava ou caiu no vazio!`,
            "#ef4444",
          );
          broadcast(wss, {
            type: "system_msg",
            text: `🔥 ${ws.username} morreu na lava ou caiu no vazio!`,
          });
          break;
        }

        case "win": {
          if (!ws.username || !activePlayers[ws.username]) return;
          const p = activePlayers[ws.username];
          p.score += 100;
          const spawn = getSpawnParams();
          p.x = spawn.x;
          p.y = spawn.y;
          p.z = spawn.z;
          p.dz = 0;
          p.dx = 0;
          p.dy = 0;
          p.lastSeen = Date.now();
          resetAcState(ws.username, spawn.x, spawn.y, spawn.z);

          addGlobalChat(
            "[SISTEMA]",
            `👑 PARABÉNS! ${ws.username} completou o Obby (+100 Pontos)!`,
            "#fbbf24",
          );
          broadcast(wss, {
            type: "system_msg",
            text: `👑 PARABÉNS! ${ws.username} completou o Obby (+100 Pontos)!`,
          });
          // Update score immediately across active users
          broadcast(wss, {
            type: "state",
            players: { ...activePlayers },
            orbs: activeOrbs.filter((o) => !collectedOrbsState[o.id]),
          });
          break;
        }

        case "orb_collected": {
          if (!ws.username || !activePlayers[ws.username]) return;
          const username = ws.username;
          const { orbId } = msg;

          if (!collectedOrbsState[orbId]) {
            // Lock orb immediately on server
            collectedOrbsState[orbId] = true;

            const p = activePlayers[username];
            const foundOrb = activeOrbs.find((o) => o.id === orbId);
            const points = foundOrb ? foundOrb.points : 10;
            p.score += points;
            p.lastSeen = Date.now();

            console.log(
              `[ORB] ${username} coletou cristal ${orbId} (+${points} pts)`,
            );
            addGlobalChat(
              "[SISTEMA]",
              `💎 ${username} coletou um cristal mágico (+${points} pts)!`,
              "#f59e0b",
            );

            // Notify everyone of the collection
            broadcast(wss, {
              type: "orb_collected",
              orbId,
              username,
              score: p.score,
            });

            broadcast(wss, {
              type: "system_msg",
              text: `💎 ${username} coletou um cristal mágico (+${points} pts)!`,
            });

            // Respawn orb after 15 seconds
            setTimeout(() => {
              delete collectedOrbsState[orbId];
              addGlobalChat(
                "[SISTEMA]",
                `🔮 Um cristal mágico reapareceu no mapa!`,
                "#10b981",
              );
              broadcast(wss, {
                type: "state",
                players: { ...activePlayers },
                orbs: activeOrbs.filter((o) => !collectedOrbsState[o.id]),
              });
              broadcast(wss, {
                type: "system_msg",
                text: `🔮 Um cristal mágico reapareceu no mapa!`,
              });
            }, 15000);
          }
          break;
        }
      }
    } catch (err) {
      console.error("[WS] Erro ao analisar comando de rede:", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      console.log(`[WS] Conexão fechada para ${ws.username}`);
      delete activePlayers[ws.username];
      removeAcState(ws.username);
      addGlobalChat(
        "[SISTEMA]",
        `🔴 ${ws.username} desconectou do servidor.`,
        "#ef4444",
      );

      broadcast(wss, {
        type: "system_msg",
        text: `🔴 ${ws.username} desconectou do servidor.`,
      });
    }
  });
}
