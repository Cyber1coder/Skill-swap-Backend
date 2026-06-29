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
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return res.status(400).json({ message: "Session not found" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Session not completed" });
    }

    // AUTH CHECK: Ensure reviewer is part of the session
    if (String(session.requester_id) !== String(reviewerId) && String(session.partner_id) !== String(reviewerId)) {
      return res.status(403).json({ message: "Not authorized to rate this session" });
    }

    // VALIDATION: Ensure reviewee_id is the other participant in the session
    const expectedRevieweeId = String(session.requester_id) === String(reviewerId) ? session.partner_id : session.requester_id;
    if (String(reviewee_id) !== String(expectedRevieweeId)) {
      return res.status(400).json({ message: "Invalid reviewee for this session" });
    }

    // Prevent duplicate rating
    const { data: existing, error: existingError } = await supabase
      .from("ratings")
      .select("*")
      .eq("session_id", session_id)
      .eq("reviewer_id", reviewerId)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ message: "Database error checking existing rating", error: existingError.message });
    }

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

    if (error) {
      return res.status(500).json({ message: "Database error submitting rating", error: error.message });
    }

    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRating };