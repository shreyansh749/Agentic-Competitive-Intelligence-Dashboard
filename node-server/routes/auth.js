const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// Cookie options
const cookieOptions = {
  httpOnly: true, // JS se access nahi hoga — XSS protection
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Token generate helper
const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

//Auth Middleware
module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // ← har route mein req.user available hoga
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log("back 1");

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password required" });
    }
    // console.log("back 2");
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    // console.log("back 3");
    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    // console.log("back 4"); 
    // console.log("Creating user with:", { name, email, password }); // Debug log
    // Create user
    
  
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
  // console.log("back 5"); 
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      message: "Account created successfully",
      user: user.toJSON(),
    });
  } catch (e) {
    console.error("[Auth Signup Error]:", e.message);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user — password field explicitly select karo
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Password check
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.json({
      message: "Login successful",
      user: user.toJSON(),
    });
  } catch (e) {
    console.error("[Auth Login Error]:", e.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post("/logout", (req, res) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
  res.json({ message: "Logged out successfully" });
});

// ── GET /api/auth/me — cookie se user nikalo ─────────────────
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user: user.toJSON() });
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// ── PUT /api/auth/profile — update profile ───────────────────
router.put("/profile", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, avatar },
      { new: true, runValidators: true },
    );

    res.json({ message: "Profile updated", user: user.toJSON() });
  } catch (e) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
