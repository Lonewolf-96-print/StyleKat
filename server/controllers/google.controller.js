import { OAuth2Client } from "google-auth-library";
import User from "../model/User.model.js";
import Barber from "../model/Barber.model.js";
import { generateToken } from "../lib/utils.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ----------------------------------------------------
   GOOGLE LOGIN FOR USER
---------------------------------------------------- */
export const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Google token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    // CASE 1: New Google user → create account
    if (!user) {
      user = new User({
        name,
        email,
        avatar: picture,
        googleId,
        password: null,      // ← Google login users have NO password
        role: "user",
      });
      await user.save();
    }

    // CASE 2: Existing user WITHOUT googleId → UPDATE their account
    else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      
      // If login was always Google → remove old password
      user.password = null;

      await user.save();
    }

    // CASE 3: Existing Google user → login normally

    const authToken = generateToken(user._id, "user", null);

    return res.json({
      message: "Google login successful",
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        googleId: user.googleId,
        passwordExists: false, // ALWAYS false for Google logins
      }
    });

  } catch (error) {
    console.error("❌ Google User Login Error:", error.message);
    return res.status(500).json({ message: "Google login failed" });
  }
};

/* ----------------------------------------------------
   GOOGLE LOGIN FOR BARBER
---------------------------------------------------- */
export const googleLoginBarber = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Google token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if barber exists
    let barber = await Barber.findOne({ email });

    if (barber) {
      const authToken = generateToken(barber._id, "barber", null);

      return res.json({
        message: "Barber Google login successful",
        token: authToken,
        barber,
      });
    }

    // Create NEW BARBER
    const newBarber = new Barber({
      salonName: `${name}'s Salon`, // default value
      ownerName: name,
      email,
      googleId,
      avatar: picture,
      password: null,
    });

    await newBarber.save();

    const authToken = generateToken(newBarber._id, "barber", null);

    return res.json({
      message: "New barber created via Google",
      token: authToken,
      barber: newBarber,
    });

  } catch (error) {
    console.error("❌ Google Barber Login Error:", error.message);
    return res.status(500).json({ message: "Google login failed", error: error.message });
  }
};
