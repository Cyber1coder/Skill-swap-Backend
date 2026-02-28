const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createPost, getPosts } = require("../controllers/forumController");

router.post("/", protect, createPost);
router.get("/", getPosts);

module.exports = router;