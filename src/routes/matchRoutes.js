const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !currentProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get all other profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Matching logic using array overlap
    const matches = profiles.filter((profile) => {
      const offeredMatch =
        currentProfile.skills_offered?.some((skill) =>
          profile.skills_wanted?.includes(skill)
        );

      const wantedMatch =
        currentProfile.skills_wanted?.some((skill) =>
          profile.skills_offered?.includes(skill)
        );

      return offeredMatch && wantedMatch;
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;