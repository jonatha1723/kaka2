import express from "express";
import { activePlayers, socialData, globalChats, activeOrbs, collectedOrbsState, addGlobalChat } from "./dbState";
import { getSpawnParams } from "../constants";
import { verifyPlayerPosition, resetAcState, isBanned, banPlayer } from "./anticheat";

export function registerApiRoutes(app: express.Express) {
  // High-performance HTTP sync api fallback router for sandboxed preview configurations
  app.post("/api/sync", (req, res) => {
    const { username, color, pos, action, chatToSend, collectedOrbId } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const name = (username as string).trim().substring(0, 15);
    if (!name) {
      return res.status(400).json({ error: "Invalid username" });
    }

    const ban = isBanned(name);
    if (ban) {
      return res.json({
        banned: true,
        reason: ban.reason,
        expiresAt: ban.expiresAt,
      });
    }

    // Join player if they under-the-radar do not have an active session
    let p = activePlayers[name];
    if (!p) {
      const spawn = getSpawnParams();
      p = {
        id: name,
        username: name,
        x: spawn.x + (Math.random() - 0.5) * 10,
        y: spawn.y + (Math.random() - 0.5) * 10,
        z: spawn.z,
        dx: 0,
        dy: 0,
        dz: 0,
        color: color || "#3b82f6",
        score: 0,
        lastSeen: Date.now(),
      };
      activePlayers[name] = p;
      addGlobalChat(
        "[SISTEMA]",
        `🟢 ${name} entrou no servidor (HTTP)!`,
        "#10b981",
      );
    }

    let correction = null;

    // Sync positions
    if (pos) {
      const currentPos = { x: p.x, y: p.y, z: p.z };
      const newPos = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dx: pos.dx,
        dy: pos.dy,
        dz: pos.dz,
      };

      const acResult = verifyPlayerPosition(name, currentPos, newPos);

      if (!acResult.valid) {
        if (acResult.ban) {
          banPlayer(name, acResult.ban.reason, acResult.ban.durationMs);
          delete activePlayers[name];
          return res.json({
            banned: true,
            reason: acResult.ban.reason,
            expiresAt: Date.now() + acResult.ban.durationMs,
          });
        } else if (acResult.forceKill) {
          const spawn = getSpawnParams();
          p.x = spawn.x;
          p.y = spawn.y;
          p.z = spawn.z;
          p.dz = 0;
          p.dx = 0;
          p.dy = 0;
          correction = { x: spawn.x, y: spawn.y, z: spawn.z };
          resetAcState(name, spawn.x, spawn.y, spawn.z);
        } else if (acResult.correctionPos) {
          p.x = acResult.correctionPos.x;
          p.y = acResult.correctionPos.y;
          p.z = acResult.correctionPos.z;
          p.dx = 0;
          p.dy = 0;
          p.dz = 0;
          correction = acResult.correctionPos;
        }
      } else {
        p.x = pos.x;
        p.y = pos.y;
        p.z = pos.z;
        p.dx = pos.dx;
        p.dy = pos.dy;
        p.dz = pos.dz;
        p.score = pos.score;
      }
    }
    p.lastSeen = Date.now();

    // Sync custom events
    if (action === "died") {
      const spawn = getSpawnParams();
      p.x = spawn.x;
      p.y = spawn.y;
      p.z = spawn.z;
      p.dz = 0;
      p.dx = 0;
      p.dy = 0;
      resetAcState(name, spawn.x, spawn.y, spawn.z);
      addGlobalChat(
        "[SISTEMA]",
        `🔥 ${name} morreu na lava ou caiu no vazio!`,
        "#ef4444",
      );
    } else if (action === "win") {
      p.score += 100;
      const spawn = getSpawnParams();
      p.x = spawn.x;
      p.y = spawn.y;
      p.z = spawn.z;
      p.dz = 0;
      p.dx = 0;
      p.dy = 0;
      resetAcState(name, spawn.x, spawn.y, spawn.z);
      addGlobalChat(
        "[SISTEMA]",
        `👑 PARABÉNS! ${name} completou o Obby (+100 Pontos)!`,
        "#fbbf24",
      );
    }

    if (chatToSend) {
      const text = (chatToSend as string).trim().substring(0, 80);
      if (text) {
        addGlobalChat(name, text, p.color);
      }
    }

    if (collectedOrbId) {
      if (!collectedOrbsState[collectedOrbId]) {
        collectedOrbsState[collectedOrbId] = true;
        const foundOrb = activeOrbs.find((o) => o.id === collectedOrbId);
        const points = foundOrb ? foundOrb.points : 10;
        p.score += points;

        addGlobalChat(
          "[SISTEMA]",
          `💎 ${name} coletou um cristal mágico (+${points} pts)!`,
          "#f59e0b",
        );

        setTimeout(() => {
          delete collectedOrbsState[collectedOrbId];
          addGlobalChat(
            "[SISTEMA]",
            `🔮 Um cristal mágico reapareceu no mapa!`,
            "#10b981",
          );
        }, 15000);
      }
    }

    // Return the latest active state
    res.json({
      players: { ...activePlayers },
      orbs: activeOrbs.filter((o) => !collectedOrbsState[o.id]),
      chats: globalChats,
      correction,
    });
  });

  // API endpoints for social
  app.get("/api/social/:username", (req, res) => {
    const { username } = req.params;
    if (!socialData[username]) socialData[username] = { friends: [], requests: [] };
    res.json(socialData[username]);
  });

  app.post("/api/social/request", (req, res) => {
    const { from, to } = req.body;
    if (!socialData[to]) socialData[to] = { friends: [], requests: [] };
    if (!socialData[to].requests.includes(from)) {
        socialData[to].requests.push(from);
    }
    res.json({ success: true });
  });

  app.post("/api/social/accept", (req, res) => {
    const { accepter, requester } = req.body;
    if (!socialData[accepter]) socialData[accepter] = { friends: [], requests: [] };
    if (!socialData[requester]) socialData[requester] = { friends: [], requests: [] };
    socialData[accepter].requests = socialData[accepter].requests.filter(r => r !== requester);
    if (!socialData[accepter].friends.includes(requester)) socialData[accepter].friends.push(requester);
    if (!socialData[requester].friends.includes(accepter)) socialData[requester].friends.push(accepter);
    res.json({ success: true });
  });

  app.post("/api/social/decline", (req, res) => {
    const { decliner, requester } = req.body;
    if (!socialData[decliner]) socialData[decliner] = { friends: [], requests: [] };
    socialData[decliner].requests = socialData[decliner].requests.filter(r => r !== requester);
    res.json({ success: true });
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      onlinePlayers: Object.keys(activePlayers).length,
    });
  });
}
