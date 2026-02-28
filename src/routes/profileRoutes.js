const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.get("/", async (req, res) => {
  const { data } = await supabase
    .from("users")
    .select("email, bio, interests")
    .eq("id", req.user.id)
    .single();

  res.json(data);
});

router.put("/", async (req, res) => {
  const { bio, interests } = req.body;

  await supabase
    .from("users")
    .update({ bio, interests })
    .eq("id", req.user.id);

  res.json({ message: "Profile updated" });
});

module.exports = router;