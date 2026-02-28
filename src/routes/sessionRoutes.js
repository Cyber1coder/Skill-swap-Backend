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
      session_type,
      mode,
      location,
      meeting_link
    } = req.body;

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          requester_id: req.user.id,
          partner_id,
          skill_topic,
          session_date,
          duration_minutes,
          session_type: session_type || "one-on-one",
          mode: mode || "virtual",
          location: mode === "in-person" ? location : null,
          meeting_link: mode === "virtual" ? meeting_link : null,
          status: "pending"
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
// Get My Sessions
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
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

    // Get session first
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Permission logic
    if (
      status === "accepted" || status === "rejected"
    ) {
      if (session.partner_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    if (status === "cancelled") {
      if (session.requester_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    if (status === "completed") {
      if (session.status !== "accepted") {
        return res.status(400).json({ message: "Session must be accepted first" });
      }
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", req.params.id)
      .select();

    if (error) return res.status(400).json(error);

    res.json(data[0]);

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