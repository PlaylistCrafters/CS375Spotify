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
  generateGame,
  calculateTimeTaken,
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

  socket.on("startGame", () => {
    try {
      const roomId = socket.roomId; // Retrieve the stored roomId from the socket object
      if (!games[roomId]) {
        throw new Error("Invalid roomId");
      }
      // Generate game data and questions for the room using the existing generateGame function
      generateGame(roomId);

      // Notify players in the room that the game has started
      io.to(roomId).emit("gameStarted");

      // Start first round
      startRound(roomId, 1);
    } catch (error) {
      console.error("Error starting game:", error);
      // Handle error, emit an error event to the host
      socket.emit("startGameError");
    }
  });

  socket.on("submitAnswer", ({ playerId, answer }) => {
    try {
      const roomId = socket.roomId; // Retrieve the stored roomId from the socket object
      // Check if the provided playerId is valid and in the correct format
      if (!games[roomId] || !games[roomId].userData[playerId]) {
        throw new Error("Invalid playerId");
      }

      const playerAnswer = {
        answer: answer,
        timeTaken: calculateTimeTaken(startTime), // Implement this function
      };
      games[roomId].points[playerId] = playerAnswer;

      // Emit a confirmation event to the player that their answer was received
      socket.emit("answerSubmitted");
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Handle the error, possibly by emitting an error event to the player
      socket.emit("answerSubmissionError");
    }
  });

  socket.on("playerAnswer", ({ answer, questionIndex }) => {
    evaluatePlayerAnswer(socket.roomId, socket.playerId, answer);
  });
});

server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
