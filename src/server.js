const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const forumRoutes = require("./routes/forumRoutes");
const matchRoutes = require("./routes/matchRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const skillRoutes = require("./routes/skillRoutes");

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);   // ✅ FIXED HERE
app.use("/sessions", sessionRoutes);
app.use("/ratings", ratingRoutes);
app.use("/forum", forumRoutes);
app.use("/matches", matchRoutes);
app.use("/resources", resourceRoutes);
app.use("/skills", skillRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});