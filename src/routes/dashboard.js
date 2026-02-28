const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    stats: {
      skills: 5,
      matches: 12,
      sessions: 8
    },
    skills: [
      {
        title: "React Development",
        description: "Frontend UI building"
      },
      {
        title: "UI/UX Design",
        description: "Wireframing & Figma"
      },
      {
        title: "Java Programming",
        description: "OOP & DSA"
      }
    ]
  });
});

module.exports = router;