const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, async (req, res) => {
  const { title, description, link } = req.body;

  const { data, error } = await supabase
    .from("resources")
    .insert([{
      user_id: req.user.id,
      title,
      description,
      link
    }])
    .select();

  if (error) return res.status(400).json(error);

  res.json(data[0]);
});

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json(error);

  res.json(data);
});

module.exports = router;