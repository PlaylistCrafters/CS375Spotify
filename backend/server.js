require("dotenv").config();

const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
const clientProtocol = process.env.CLIENT_PROTOCOL;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;

app.use(express.json());
const cors = require("cors");
app.use(
  cors({
    origin: [
      `${clientProtocol}${clientHost}`,
      `${clientProtocol}${clientHost}:${clientPort}`,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(require("cookie-parser")());

const gameRoutes = require("./routes/game-routes.js");

app.use(gameRoutes);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: [
      `${clientProtocol}${clientHost}`,
      `${clientProtocol}${clientHost}:${clientPort}`,
    ],
    methods: ["GET", "POST"],
  },
});

const {
  addPlayerToGame,
  evaluatePlayerAnswer,
  generateGame,
  startRound,
  removePlayerFromGame,
  getPlayers,
  getHostPlayerId,
  doesRoomExist,
} = require("./controllers/game-controllers.js");

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const roomId = socket.roomId;
    if (roomId !== null && socket.playerId !== null) {
      removePlayerFromGame(roomId, socket.playerId);

      if (doesRoomExist(roomId)) {
        const players = getPlayers(roomId);
        const hostPlayerId = getHostPlayerId(roomId);
        io.to(roomId).emit("updateLobby", {
          players: players,
          hostPlayerId: hostPlayerId,
        });
      }
    }
  });

  socket.on("joinRoom", async ({ roomId, player }) => {
    try {
      await addPlayerToGame(roomId, {
        ...player,
        accessToken: socket.handshake.auth.token,
      });
      socket.roomId = roomId;
      socket.playerId = player.playerId;
      socket.join(roomId);
      const players = getPlayers(roomId);
      const hostPlayerId = getHostPlayerId(roomId);
      io.to(roomId).emit("updateLobby", {
        players: players,
        hostPlayerId: hostPlayerId,
      });
    } catch (error) {
      console.log({ event: "joinRoom", error: error });
      io.to(socket.id).emit("joinRoomError");
    }
  });

  socket.on("startGame", async ({ roomId }) => {
    try {
      await generateGame(roomId);
      startRound(io, roomId);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  });

  socket.on("submitAnswer", ({ answer }) => {
    try {
      evaluatePlayerAnswer(socket.roomId, socket.playerId, answer);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  });
});

server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
