const supabase = require("../config/supabase");

const createPost = async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ user_id: req.user.id, ...req.body }])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  res.json(data);
};

const getPosts = async (req, res) => {
  const { data } = await supabase.from("posts").select("*");
  res.json(data);
};

module.exports = { createPost, getPosts };