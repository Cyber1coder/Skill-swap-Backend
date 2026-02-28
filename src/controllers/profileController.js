const supabase = require("../config/supabase");

const createProfile = async (req, res) => {
  const userId = req.user.id;
  const body = req.body;

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ user_id: userId, ...body }])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  res.json(data);
};

const getMyProfile = async (req, res) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  res.json(data);
};

module.exports = { createProfile, getMyProfile };