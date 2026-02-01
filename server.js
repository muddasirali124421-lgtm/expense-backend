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

dotenv.config();  // load .env

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
