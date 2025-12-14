// import jwt from "jsonwebtoken";
// import User from "../model/User.model.js";

// export const verifyUserToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     console.log("Authorization header122:", authHeader);
//     if (!authHeader || !authHeader.startsWith("Bearer "))
//       return res.status(401).json({ message: "No token provided" });
      
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded token:", decoded); 
//     req.user = await User.findById(decoded.id).select("-password");

//     if (!req.user)
//       return res.status(404).json({ message: "User not found" });

//     next();
//   } catch (error) {
//     console.error("User auth error:", error);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };
import jwt from "jsonwebtoken";

export const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("❌ No Authorization header found");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  console.log("Authorization header:", authHeader);
  console.log("Extracted token:", token);

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    // ✅ Must match the same secret used during jwt.sign()
    const secret = process.env.JWT_SECRET || "mysecretkey";
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    console.log("✅ Token verified:", decoded);
    next();
  } catch (err) {
    console.error("User auth error:", err);
    res.status(401).json({ message: "Unauthorized: invalid or expired token" });
  }
};
