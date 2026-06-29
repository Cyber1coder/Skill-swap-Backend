const supabase = require("../config/supabase");

// ===============================
// Create Session
// ===============================
const createSession = async (req, res) => {
  try {
    const requesterId = req.user.id;
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
          requester_id: requesterId,
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

    if (error) {
      return res.status(500).json({ message: "Database error creating session", error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// Get My Sessions (With Associated Ratings Only)
// ===============================
const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's sessions
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .or(`requester_id.eq.${userId},partner_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: "Database error fetching sessions", error: error.message });
    }

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      
      // Fetch ratings ONLY for these sessions (privacy & scaling fix)
      const { data: ratings, error: ratingsError } = await supabase
        .from("ratings")
        .select("*")
        .in("session_id", sessionIds);

      if (!ratingsError && ratings) {
        const sessionsWithRatings = sessions.map(session => ({
          ...session,
          ratings: ratings.filter(r => r.session_id === session.id)
        }));
        return res.json(sessionsWithRatings);
      }
    }

    res.json(sessions || []);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// Update Session Status
// ===============================
const updateSessionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Permission checks
    if ((status === "accepted" || status === "rejected") && String(session.partner_id) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "cancelled" && String(session.requester_id) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "completed" && session.status !== "accepted") {
      return res.status(400).json({ message: "Session must be accepted first" });
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Database error updating session", error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===============================
// Delete Session (Secure: Requester or Partner only)
// ===============================
const deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (String(session.requester_id) !== String(userId) && String(session.partner_id) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this session" });
    }

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      return res.status(500).json({ message: "Database error deleting session", error: error.message });
    }

    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createSession,
  getMySessions,
  updateSessionStatus,
  deleteSession
};