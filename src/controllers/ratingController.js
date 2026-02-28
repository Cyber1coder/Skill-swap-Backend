const supabase = require("../config/supabase");

const createRating = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { session_id, reviewee_id, rating, feedback } = req.body;

    if (!session_id || !reviewee_id || !rating) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    // Check session exists & completed
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (!session || session.status !== "completed") {
      return res.status(400).json({ message: "Session not completed" });
    }

    // Prevent duplicate rating
    const { data: existing } = await supabase
      .from("ratings")
      .select("*")
      .eq("session_id", session_id)
      .eq("reviewer_id", reviewerId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Already rated" });
    }

    const { data, error } = await supabase
      .from("ratings")
      .insert([
        {
          session_id,
          reviewer_id: reviewerId,
          reviewee_id,
          rating,
          feedback
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

module.exports = { createRating };