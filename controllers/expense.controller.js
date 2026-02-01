import Expense from '../models/Expense.js';
import Notification from "../models/Notification.js";

// Get all expenses for a user
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single expense
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new expense
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    
    const expense = new Expense({
      title,
      amount,
      category,
      description,
      date: date || new Date(),
      user: req.user.id
    });
    
    const savedExpense = await expense.save();

    await Notification.create({
      user: req.user.id,
      type: "expense",
      title: "New expense added",
      message: `${savedExpense.title} - $${Number(savedExpense.amount).toFixed(2)}`,
      expense: savedExpense._id,
      read: false,
    });

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
