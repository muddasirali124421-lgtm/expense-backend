import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ user: userId, read: false }, { read: true });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
