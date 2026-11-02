import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

// @desc    Get all notifications for logged-in user or demo session
// @route   GET /api/notifications
// @access  Public / Optional Auth
export const getMyNotifications = async (req, res) => {
  try {
    let userId = req.user?._id;
    if (!userId) {
      const defaultUser = await User.findOne({ email: 'varsharani@eventco.in' }) || await User.findOne({ role: 'Organizer' });
      userId = defaultUser?._id;
    }

    if (!userId) {
      return res.status(200).json({
        success: true,
        unreadCount: 0,
        count: 0,
        notifications: [],
      });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch notifications',
    });
  }
};

// @desc    Get unread notification count for logged-in user
// @route   GET /api/notifications/unread-count
// @access  Public / Optional Auth
export const getUnreadCount = async (req, res) => {
  try {
    let userId = req.user?._id;
    if (!userId) {
      const defaultUser = await User.findOne({ email: 'varsharani@eventco.in' }) || await User.findOne({ role: 'Organizer' });
      userId = defaultUser?._id;
    }

    if (!userId) {
      return res.status(200).json({ success: true, unreadCount: 0 });
    }

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch unread count',
    });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Notification not found or access denied',
      });
    }

    const remainingUnread = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
      unreadCount: remainingUnread,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update notification',
    });
  }
};

// @desc    Mark all notifications as read for logged-in user
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
      unreadCount: 0,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to mark all as read',
    });
  }
};

