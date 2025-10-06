import express from "express";
import { register, verifyOtp } from "../controller/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);

export default router;