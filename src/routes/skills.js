const express = require("express");
const router = express.Router();

let skills = []; // Temporary memory (we will connect DB later)

// Get skills for logged-in user
router.get("/", (req, res) => {
  res.json(skills);
});

// Add new skill
router.post("/", (req, res) => {
  const { title, description } = req.body;

  const newSkill = {
    id: Date.now(),
    title,
    description
  };

  skills.push(newSkill);

  res.json(newSkill);
});

module.exports = router;