const supabase = require("../config/supabase");

const createSession = async (req, res) => {
  try {
    const requesterId = req.user.id;

    const {
      partner_id,
      skill_topic,
      session_date,
      duration_minutes
    } = req.body;

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          requester_id: requesterId,
          partner_id,
          skill_topic,
          session_date,
          duration_minutes
        }
      ])
      .select()
      .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .or(`requester_id.eq.${userId},partner_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, status } = req.body;

    const allowedStatuses = ["accepted", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.partner_id !== userId && status !== "completed") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) return res.status(500).json(error);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSession, getMySessions, updateSessionStatus };