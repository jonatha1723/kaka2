import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { activePlayers, activeOrbs, collectedOrbsState } from "./src/server/dbState";
import { handleWsConnection, broadcast } from "./src/server/wsHandler";
import { registerApiRoutes } from "./src/server/apiHandler";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const PORT = 3000;

  // Middleware for parsing json request bodies
  app.use(express.json());

  // Register HTTP backup sync and Social/Friendship API routes
  registerApiRoutes(app);

  // Setup WS connection hook using our modular connection handler
  wss.on("connection", (ws: WebSocket & { username?: string }) => {
    handleWsConnection(ws, wss);
  });

  // Upgrade normal HTTP request to WebSockets cleanly on /ws route
  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url
      ? new URL(request.url, `http://${request.headers.host}`).pathname
      : "";
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // Periodically broadcast player positions and state updates (25Hz / matching physical 40ms scale)
  setInterval(() => {
    if (Object.keys(activePlayers).length > 0) {
      broadcast(wss, {
        type: "state",
        players: { ...activePlayers },
        orbs: activeOrbs.filter((o) => !collectedOrbsState[o.id]),
      });
    }
  }, 40);

  // Integration of Vite Hot Middleware Asset routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[SERVER] Servidor full-stack modular rodando em http://localhost:${PORT}`,
    );
  });
}

startServer();
