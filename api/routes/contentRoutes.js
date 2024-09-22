const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { getAllContents, getContentById, searchContent } = require("../controllers/contentController");

const router = express.Router();
router.get("/", authenticateToken, getAllContents);
router.get("/:id", authenticateToken, getContentById);
router.get("/search", authenticateToken, searchContent);

module.exports = router;
