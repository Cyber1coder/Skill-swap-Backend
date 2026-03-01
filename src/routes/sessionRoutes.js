const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

// ===============================
// Create Session
// ===============================
router.post("/", protect, async (req, res) => {
  try {
    const {
      partner_id,
      skill_topic,
      session_date,
      duration_minutes,
      mode,
      meeting_link,
      location,
      session_type
    } = req.body;

    if (!partner_id || !skill_topic || !session_date || !duration_minutes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          requester_id: req.user.id,
          partner_id,
          skill_topic,
          session_date,
          duration_minutes,
          mode: mode || "virtual",
          meeting_link: meeting_link || null,
          location: location || null,
          session_type: session_type || "one-on-one",
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) return res.status(400).json(error);

    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Get My Sessions (With Ratings)
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        ratings (
          id,
          rating,
          feedback,
          reviewer_id
        )
      `)
      .or(`requester_id.eq.${req.user.id},partner_id.eq.${req.user.id}`)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json(error);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Update Session Status
// ===============================
router.patch("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (
      (status === "accepted" || status === "rejected") &&
      String(session.partner_id) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (
      status === "cancelled" &&
      String(session.requester_id) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "completed" && session.status !== "accepted") {
      return res.status(400).json({ message: "Session must be accepted first" });
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json(error);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Delete Session
// ===============================
router.delete("/:id", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(400).json(error);

    res.json({ message: "Session deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;