const express = require("express");
const router = express.Router();

const { authorize } = require("../controllers/spotify-controllers.js");

router.get("/login", authorize);

module.exports = router;
