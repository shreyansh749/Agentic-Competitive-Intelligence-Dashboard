const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connect
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/competitive_intel",
  )
  .then(() => console.log("[MongoDB] Connected"))
  .catch((err) => console.error("[MongoDB Error]:", err));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // ← cookies ke liye zaroori
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser()); // ← cookies parse karne ke liye

app.use("/api", reportsRouter);
app.use("/api/auth", authRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Node server running on port ${PORT}`);
});
