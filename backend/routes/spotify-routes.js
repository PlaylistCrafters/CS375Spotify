const express = require("express");
const router = express.Router();

const {
  authorize,
  callback,
} = require("../controllers/spotify-controllers.js");

router.get("/login", authorize);
router.get("/callback", callback);

module.exports = router;
