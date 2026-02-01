import express from "express";
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from "../controllers/expense.controller.js";

const router = express.Router();

// Protect all expense routes - need authentication middleware
import { protect } from "../middleware/auth.middleware.js";

router.use(protect); // All routes below this require authentication

router.get("/", getExpenses);
router.get("/:id", getExpense);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
