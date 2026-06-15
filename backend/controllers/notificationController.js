import Notification from '../models/Notification.js';

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching notifications' });
  }
};

// Mark all unread notifications as read for the logged-in user
export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating notifications' });
  }
};

import Workspace from '../models/Workspace.js';

// Helper to broadcast notifications to all workspace members except sender
export const createWorkspaceNotification = async (workspaceId, senderId, action, entityTitle) => {
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return;
    
    const notifications = workspace.members
      .filter((m) => m.user.toString() !== senderId.toString())
      .map((m) => ({
        recipient: m.user,
        sender: senderId,
        workspaceId,
        action,
        entityTitle,
      }));
      
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to create notifications:', error);
  }
};
