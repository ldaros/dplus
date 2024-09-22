const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require("../controllers/watchlistController");

const router = express.Router();
router.get("/list", authenticateToken, getWatchlist);
router.post("/add", authenticateToken, addToWatchlist);
router.post("/remove", authenticateToken, removeFromWatchlist);

module.exports = router;
