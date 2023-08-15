const express = require("express");
const app = express();

app.use(express.json());
app.use(require("cors")());

const spotifyRoutes = require("./routes/spotify-routes.js");
const gameRoutes = require("./routes/game-routes.js");

app.use(spotifyRoutes);
app.use(gameRoutes);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const port = process.env.CLIENT_PORT || 3001;
const clientHostname = process.env.CLIENT_URL || "http://localhost";
const clientPort = process.env.CLIENT_PORT || 3000;
const io = new Server(server, {
  cors: {
    origin: `${clientHostname}:${clientPort}`,
    methods: ["GET"],
  },
});

const {
  addPlayerToGame,
  removePlayerFromGame,
} = require("./controllers/game-controllers.js");

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (socket.roomId !== null && socket.playerId !== null) {
      removePlayerFromGame(socket.roomId, socket.playerId);
    }
  });

  socket.on("joinRoom", async ({ roomId, player }) => {
    try {
      await addPlayerToGame(roomId, {
        ...player,
        accessToken: socket.handshake.headers["accesstoken"],
      });
      socket.roomId = roomId;
      socket.playerId = player.playerId;
      socket.join(roomId);
    } catch (error) {
      console.log({ event: "joinRoom", error: error });
      io.to(socket.id).emit("joinRoomError");
    }
  });
});

app.use(spotifyRoutes);

server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
