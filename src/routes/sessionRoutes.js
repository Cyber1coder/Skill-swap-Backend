const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createSession,
  getMySessions,
  updateSessionStatus,
  deleteSession
} = require("../controllers/sessionController");

// Create Session
router.post("/", protect, createSession);

// Get My Sessions
router.get("/", protect, getMySessions);

// Update Session Status
router.patch("/:id", protect, updateSessionStatus);

// Delete Session
router.delete("/:id", protect, deleteSession);

module.exports = router;