const express = require("express");
const router = express.Router();

const { createGame } = require("../controllers/game-controllers.js");

router.post("/api/rooms", createRoom);

module.exports = router;
