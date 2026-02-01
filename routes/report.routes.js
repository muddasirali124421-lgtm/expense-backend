import express from "express";
import { getExpenseReport, exportExpenseReport } from "../controllers/report.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get expense report with filters
router.get("/", auth, getExpenseReport);

// Export expense report
router.get("/export", auth, exportExpenseReport);

export default router;
