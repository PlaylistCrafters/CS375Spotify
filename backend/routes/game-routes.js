const express = require("express");
const router = express.Router();

const { createRoom, getRoom } = require("../controllers/game-controllers.js");

router.post("/api/rooms", createRoom);
router.post("/api/rooms", getRoom);

module.exports = router;
