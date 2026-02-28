const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Temporary browser test route
router.get("/login-test", async (req, res) => {
  req.body = {
    email: "revati@test.com",
    password: "123456"
  };

  await login(req, res);
});

module.exports = router;