import jwt from "jsonwebtoken";

export const generateToken = (userId, role, shopId=null,res) => {
  const payload = { id: userId, role }
  

  if (payload.role === "barber" && shopId) {
    payload.shopId = shopId.toString();
    console.log("Barber logged in for shopId:", shopId);
  }
  else {
    console.log("Generating token for user with role:", role);
  }
  if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined!");
}
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  //   res.cookie("jwt", token, {
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // MS
  //   httpOnly: true, // prevent XSS attacks cross-site scripting attacks
  //   sameSite: "strict", // CSRF attacks cross-site request forgery attacks
  //   secure: process.env.NODE_ENV !== "development",
  // });

  console.log("Generated JWT token payload:", payload);
  return token;
};
