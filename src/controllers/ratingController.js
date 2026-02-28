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