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
  evaluatePlayerAnswer,
} = require("./controllers/game-controllers.js");

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("joinRoom", ({ roomId, player }) => {
    try {
      player.accessToken = socket.handshake.headers["access-token"];
      addPlayerToGame(roomId, player);
      socket.roomId = roomId;
      socket.playerId = player.id;
      socket.join(roomId);
    } catch (error) {
      console.log({ event: "joinRoom", error: error });
      socket.to(socket.id).emit("joinRoomError");
    }
  });

  socket.on("playerAnswer", ({ roomId, player, answer }) => {
    evaluatePlayerAnswer(roomId, player, answer);
  });
});

server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
