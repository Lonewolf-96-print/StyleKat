import express from "express";
import User from "../model/User.model.js";
import { generateToken } from "../lib/utils.js";
import { verifyUserToken } from "../middleware/verifyUserToken.js";
import { protectUser } from "../middleware/user.middleware.js";
import bcrypt from "bcryptjs";
import { googleLoginUser } from "../controllers/google.controller.js";
const router = express.Router();
router.use(express.json());
// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, phone, password, role: "user" });
    const token = generateToken(user._id, "user", null, res);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,

      },
      role: user.role
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("📩 Login attempt:", email, password);

    const user = await User.findOne({ email }).select("+password") //;

    if (!user) {
      // console.log("❌ No user found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, "user", null, res);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/google/user", googleLoginUser);
// PUT /api/users/change-password
router.put("/change-password", protectUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // CASE 1: GOOGLE USER → no existing password → can SET password
    if (!user.password) {
      // Google user setting password for the first time
      user.password = newPassword;
      await user.save();

      return res.json({
        message: "Password set successfully",
        passwordExists: true
      });
    }

    // CASE 2: NORMAL USER → must provide current password
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.json({
      message: "Password updated successfully",
      passwordExists: true
    });

  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// routes/userRoutes.js




// ✅ GET current user
router.get("/me", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine whether the user logged in via Google OR password
    const passwordExists = !!(user.password && user.password !== "" && user.password !== null);

    const normalized = {
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      googleId: user.googleId || null,
      role: user.role || "user",
      createdAt: user.createdAt,
      passwordExists, // ← Fixed logic
      isGoogleUser: user.googleId ? true : false, // ← Helps frontend
    };

    return res.json(normalized);
  } catch (err) {
    console.error("❌ /me route error:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

// ✅ UPDATE current user
router.put("/me", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧠 Update fields if provided in request body
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.bio = req.body.bio || user.bio;


    // 🧠 If user updates password, hash it in model pre-save hook
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      bio: updatedUser.bio,
      token: generateToken(updatedUser._id, "user", null, res), // optional, if you want to refresh JWT
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





export default router;
