import mongoose from "mongoose";

const CATEGORY_ENUM = [
  "food",
  "transport",
  "housing",
  "utilities",
  "shopping",
  "healthcare",
  "entertainment",
  "education",
  "travel",
  "subscriptions",
  "insurance",
  "savings",
  "personal-care",
  "gifts",
  "taxes",
  "other",
];

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORY_ENUM,
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
