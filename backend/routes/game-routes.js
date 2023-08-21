const express = require("express");
const router = express.Router();

const { createRoom, getRoom } = require("../controllers/game-controllers.js");

router.post("/api/rooms", createRoom);
router.get("/api/rooms/:roomId", getRoom);

module.exports = router;
