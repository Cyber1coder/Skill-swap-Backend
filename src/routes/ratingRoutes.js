const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createRating } = require("../controllers/ratingController");

router.post("/", protect, createRating);

module.exports = router;