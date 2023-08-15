const express = require("express");
const app = express();
const spotifyRoutes = require("./routes/spotify.js");
app.use(require("cors")());

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

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("test", () => {
    socket.join();
    console.log("this is a test");
  });
});

app.use(spotifyRoutes);

server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
