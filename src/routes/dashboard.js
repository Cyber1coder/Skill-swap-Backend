const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user's skill cards count
    const { count: skillCount, error: skillError } = await supabase
      .from("skill_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (skillError) return res.status(400).json(skillError);

    // 2. Get user's sessions count
    const { count: sessionCount, error: sessionError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},partner_id.eq.${userId}`);

    if (sessionError) return res.status(400).json(sessionError);

    // 3. Get matches count (using match logic)
    const { data: cards, error: cardsError } = await supabase
      .from("skill_cards")
      .select("*");

    if (cardsError) return res.status(400).json(cardsError);

    const myCards = cards.filter((card) => card.user_id === userId);
    const otherCards = cards.filter((card) => card.user_id !== userId);

    const myOffered = myCards
      .filter((c) => ["teach", "offer", "offered"].includes(c.skill_type?.toLowerCase()))
      .map((c) => c.skill_title?.toLowerCase().trim());

    const myWanted = myCards
      .filter((c) => ["learn", "wanted", "want", "request"].includes(c.skill_type?.toLowerCase()))
      .map((c) => c.skill_title?.toLowerCase().trim());

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

    let matchCount = 0;
    const otherUserIds = Object.keys(otherUserSkills);
    otherUserIds.forEach((uId) => {
      const skills = otherUserSkills[uId];
      const offeredMatch = myOffered.some((skill) => skills.wanted.includes(skill));
      const wantedMatch = myWanted.some((skill) => skills.offered.includes(skill));
      if (offeredMatch && wantedMatch) {
        matchCount++;
      }
    });

    // 4. Return dynamic stats and user's skill cards
    res.json({
      stats: {
        skills: skillCount || 0,
        matches: matchCount || 0,
        sessions: sessionCount || 0
      },
      skills: myCards.map((c) => ({
        id: c.id,
        title: c.skill_title,
        description: c.description,
        type: c.skill_type,
        level: c.skill_level
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;