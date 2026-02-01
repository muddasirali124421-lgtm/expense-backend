import express from "express";
import { uploadProfileImage, getProfile, updateIncome, updateProfile, upload } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get user profile
router.get("/profile", auth, getProfile);

// Upload profile image
router.post("/profile-image", auth, upload.single('profileImage'), uploadProfileImage);

// Update profile
router.patch("/profile", auth, updateProfile);

// Update income
router.patch("/income", auth, updateIncome);

export default router;
