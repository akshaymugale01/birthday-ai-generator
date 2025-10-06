import type { Request, Response } from "express";
import User from "../models/User.js";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Validate India +91 Phone 
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const register = async (req: Request, res: Response) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, phone, acceptTerms, receivePromo } = req.body;
    
    // Validates
    if (!name || !email || !phone) {
      console.log("Validation failed: missing fields");
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, msg: "Invalid email format" });
    }
    
    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, msg: "Invalid phone number format" });
    }

    if (!acceptTerms) {
      return res.status(400).json({ success: false, msg: "Please accept terms and conditions" });
    }
    
    // Validates User exist
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists" });
    }
    
    const user = await User.create({ name, email, phone });
    res.json({ success: true, user: user._id, otp: "1234" }); 
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, userId } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ success: false, msg: "OTP and user ID are required" });
    }
    
    // Hardcoded otp
    if (otp === "1234") {
      await User.findByIdAndUpdate(userId, { isVerified: true });
      res.json({ success: true, msg: "OTP verified successfully" });
    } else {
      res.status(400).json({ success: false, msg: "Invalid OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
