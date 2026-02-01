import User from "../models/User.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { income } = req.body;

    const parsedIncome = Number(income);
    if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
      return res.status(400).json({ message: "Income must be a valid non-negative number" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { income: parsedIncome },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Income updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName } = req.body;

    if (typeof fullName !== "string") {
      return res.status(400).json({ message: "fullName must be a string" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName: fullName.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export { upload };
