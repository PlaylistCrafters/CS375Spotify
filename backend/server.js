require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("cors")());
app.use(require("cookie-parser")());

const spotifyRoutes = require("./routes/spotify-routes.js");
const gameRoutes = require("./routes/game-routes.js");

app.use(spotifyRoutes);
app.use(gameRoutes);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const serverPort = process.env.SERVER_PORT;
const clientProtocol = process.env.CLIENT_PROTOCOL;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;

const io = new Server(server, {
  cors: {
    origin: `${clientProtocol}${clientHost}:${clientPort}`,
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

server.listen(serverPort, () => {
  console.log(`listening on port: ${serverPort}`);
});
