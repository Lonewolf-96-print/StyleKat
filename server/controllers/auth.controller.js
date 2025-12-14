import express from "express"
import User from "../model/User.model.js"
import jwt from "jsonwebtoken";
import Barber from "../model/Barber.model.js";
import bcrypt from "bcryptjs";
import Service from "../model/Service.js";
import Staff from "../model/Staff.model.js";
import PaymentMethod from "../model/PaymentMethod.model.js";
import { generateToken } from "../lib/utils.js";
export const userSignup = async(req,res) =>{
    try{
    const {name,email,password,role} = req.body;
    if(!name ||!email || !password) return res.status(400).json({message:"All fields are required"});
    const hashed = await bcrypt.hash(password,10);
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });
    const newUser = new User({
       name,email,password : hashed,role:role || "CUSTOMER"
    })
    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id,"user",null);
      await newUser.save();
      res.status(201).json({ message: "Signup successful", user: newUser });

    
}


}catch(error){
    console.error("Error in signup controller",error.message)

}}

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
}
export const barberSignup = async (req, res) => {
 try {
    const { salonName, ownerName, phoneNumber, email, address, password } = req.body;

    // Validate required fields
    if (!salonName || !phoneNumber || !email || !address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await Barber.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

  
  

    // Create new barber
    const newBarber = new Barber({
       
      salonName,
      ownerName,
      phoneNumber,
      email,
      password,
      address,
      barberCode : "BARBER"+Date.now(),
    });

    await newBarber.save();

    // Default services to create for the barber
    const defaultServices = [
      { name: "Haircut", price: 250, duration: 30, isActive: true },
      { name: "Beard Trim", price: 150, duration: 20, isActive: true },
      { name: "Facial", price: 500, duration: 45, isActive: true },
      
    ];
 

    // Attach barberId to each service
    const servicesWithBarber = defaultServices.map((svc) => ({
      ...svc,
      barberId: newBarber._id,
    }));

    // Save default services in DB
    const existingServices = await Service.find({ barberId: newBarber._id });
if (existingServices.length === 0) {
  await Service.insertMany(servicesWithBarber);
  console.log("Default services added:", servicesWithBarber);
} else {
  console.log("✅ Services already exist, skipping default insert.");
}
    


//  Default staff info

    // Generate token
    const token = generateToken(newBarber._id,"barber",newBarber.shopId,res);

    // Respond with barber info
    res.status(201).json({
      message: "Signup successful",
      barber: {
        id: newBarber._id,
        
        salonName: newBarber.salonName,
        ownerName: newBarber.ownerName,
        email: newBarber.email,
        phoneNumber: newBarber.phoneNumber,
        address: newBarber.address,
      },
      token,
    });
  } catch (error) {
    console.error("Error in barber signup:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const barberLogin = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    const barber = await Barber.findOne({ email }).select("+password");
console.log("🧩 Barber found:", barber);
    if (!barber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    if (!barber.password) {
      return res
        .status(400)
        .json({ message: "No password found. Please use Google login or reset password." });
    }

    const match = await bcrypt.compare(password, barber.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Fix: generate the token correctly
    const token = generateToken(barber._id, "barber", barber._id);
  
    console.log("🔐 Barber logged in:", barber);
    res.json({
      message: "Login successful",
       // ✅ send token explicitly
      user: {
        id: barber._id,
        ownerName: barber.ownerName,
        salonName: barber.salonName,
        email: barber.email,
        role: barber.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Error in login controller:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};