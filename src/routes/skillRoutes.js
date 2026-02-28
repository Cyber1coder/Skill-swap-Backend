const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

// ===============================
// Create Skill Card
// ===============================
router.post("/", protect, async (req, res) => {
  try {
    const { skill_title, description, skill_type, skill_level, availability } = req.body;

    const { data, error } = await supabase
      .from("skill_cards")
      .insert([
        {
          user_id: req.user.id,
          skill_title,
          description,
          skill_type,
          skill_level,
          availability
        }
      ])
      .select();

    if (error) return res.status(400).json(error);

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Get All Skill Cards (Except Mine)
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("skill_cards")
      .select("*")
      .neq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json(error);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Get My Skill Cards
// ===============================
router.get("/mine", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("skill_cards")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json(error);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Delete Skill Card
// ===============================
router.delete("/:id", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("skill_cards")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) return res.status(400).json(error);

    res.json({ message: "Skill deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;