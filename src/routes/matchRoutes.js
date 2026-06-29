const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all skill cards from Supabase
    const { data: cards, error: cardsError } = await supabase
      .from("skill_cards")
      .select("*");

    if (cardsError) {
      return res.status(400).json({ message: cardsError.message });
    }

    // 2. Fetch all other users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, bio, interests")
      .neq("id", userId);

    if (usersError) {
      return res.status(400).json({ message: usersError.message });
    }

    // 3. Separate current user's skills vs other users' skills
    const myCards = cards.filter((card) => card.user_id === userId);
    const otherCards = cards.filter((card) => card.user_id !== userId);

    // Normalize and extract skill titles based on type
    const myOffered = myCards
      .filter((c) => ["teach", "offer", "offered"].includes(c.skill_type?.toLowerCase()))
      .map((c) => c.skill_title?.toLowerCase().trim());

    const myWanted = myCards
      .filter((c) => ["learn", "wanted", "want", "request"].includes(c.skill_type?.toLowerCase()))
      .map((c) => c.skill_title?.toLowerCase().trim());

    // Group other users' skills by user_id
    const otherUserSkills = {};
    otherCards.forEach((card) => {
      if (!otherUserSkills[card.user_id]) {
        otherUserSkills[card.user_id] = { offered: [], wanted: [] };
      }
      const type = card.skill_type?.toLowerCase();
      const title = card.skill_title?.toLowerCase().trim();
      if (["teach", "offer", "offered"].includes(type)) {
        otherUserSkills[card.user_id].offered.push(title);
      } else if (["learn", "wanted", "want", "request"].includes(type)) {
        otherUserSkills[card.user_id].wanted.push(title);
      }
    });

    // 4. Compute matches
    const matches = users
      .map((user) => {
        const skills = otherUserSkills[user.id];
        if (!skills) return null;

        // Find which offered skills match other's wanted
        const matchingOffered = myOffered.filter((skill) => skills.wanted.includes(skill));
        // Find which wanted skills match other's offered
        const matchingWanted = myWanted.filter((skill) => skills.offered.includes(skill));

        if (matchingOffered.length > 0 && matchingWanted.length > 0) {
          return {
            ...user,
            matching_offered: matchingOffered,
            matching_wanted: matchingWanted
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;