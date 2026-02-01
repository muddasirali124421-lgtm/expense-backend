import express from "express";
import { signupUser, loginUser, forgotPassword, verifyOTP, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
