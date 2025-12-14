// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../model/User.model.js";
import Barber from "../model/Barber.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🛑 Always initialize both as null so old values never leak
      req.user = null;
      req.barber = null;

      // First: check BARBER
      const barber = await Barber.findById(decoded.id).select("-password");
      if (barber) {
        req.barber = barber;
        return next(); // 🔥 STOP HERE (do NOT check user also)
      }

      // Then: check USER
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
        return next();
      }

      return res.status(401).json({ message: "Not authorized, invalid token" });

    } catch (error) {
      console.error("❌ Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};
