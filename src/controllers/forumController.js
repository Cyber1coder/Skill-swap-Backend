const supabase = require("../config/supabase");

// ===============================
// Create Post
// ===============================
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: req.user.id,
          title,
          content
        }
      ])
      .select()
      .single();

    if (error) return res.status(500).json(error);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Get Posts (With Author Name)
// ===============================
const getPosts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        created_at,
        users (name)
      `)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPost, getPosts };