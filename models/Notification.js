import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "expense" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
