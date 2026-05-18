// BE/index.js
import dotenv from "dotenv";
import path from "path";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bootstrap from "./src/app.controller.js";

dotenv.config({ path: path.resolve("src/config/.env") });

const app = express();
const port = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

await bootstrap(app, express);

httpServer.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`🔌 Socket.IO enabled on the same port`);
});
