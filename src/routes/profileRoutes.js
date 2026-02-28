const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

// ===============================
// Get My Profile
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, bio, interests")
      .eq("id", req.user.id)
      .single();

    if (error) return res.status(400).json(error);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Update Profile
// ===============================
router.put("/", protect, async (req, res) => {
  try {
    const { bio, interests } = req.body;

    const { error } = await supabase
      .from("users")
      .update({ bio, interests })
      .eq("id", req.user.id);

    if (error) return res.status(400).json(error);

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;