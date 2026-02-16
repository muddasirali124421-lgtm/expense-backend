import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js"; // notice .js extension
import expenseRoutes from "./routes/expense.routes.js"; // notice .js extension
import userRoutes from "./routes/user.routes.js"; // notice .js extension
import reportRoutes from "./routes/report.routes.js"; // notice .js extension
import notificationRoutes from "./routes/notification.routes.js";
import fileRoutes from "./routes/file.routes.js";

dotenv.config();  // load .env

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Serve static files from uploads directory
const uploadDirFromEnv = process.env.UPLOAD_DIR || "uploads";
const uploadsAbsolutePath = path.isAbsolute(uploadDirFromEnv)
  ? uploadDirFromEnv
  : path.join(__dirname, uploadDirFromEnv);
app.use('/uploads', express.static(uploadsAbsolutePath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
