// This service handles real-time notifications using WebSockets or polling

class NotificationService {
  constructor() {
    this.socket = null;
    this.subscribers = new Set();
    this.isConnected = false;
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.socket) return;

    // In a real app, you would connect to your WebSocket server
    // this.socket = new WebSocket(`wss://your-api.com/ws?token=${token}`);
    
    // Mock WebSocket implementation for development
    this.socket = {
      onopen: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.notifySubscribers({ type: 'connection_changed', connected: true });
      },
      onmessage: (event) => {
        // Handle incoming messages
        const message = JSON.parse(event.data);
        this.notifySubscribers(message);
      },
      onclose: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.socket = null;
        this.notifySubscribers({ type: 'connection_changed', connected: false });
        // Attempt to reconnect
        setTimeout(() => this.connect(token), 5000);
      },
      close: () => {
        if (this.socket) {
          this.socket.close();
        }
      }
    };

    // Simulate connection
    setTimeout(() => this.socket.onopen(), 1000);
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.unsubscribe(callback);
  }

  // Unsubscribe from notifications
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  // Notify all subscribers
  notifySubscribers(message) {
    this.subscribers.forEach(callback => callback(message));
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      // In a real app, you would call your API
      // const response = await api.patch(`/notifications/${notificationId}`, { read: true });
      // return response.data;
      
      // Mock implementation
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      // In a real app, you would call your API
      // const response = await api.patch('/notifications/mark-all-read');
      // return response.data;
      
      // Mock implementation
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/notifications/unread-count');
      // return response.data.count;
      
      // Mock implementation
      return Math.floor(Math.random() * 5); // Random number for demo
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Mock Notification Service

const mockApiDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for notifications
let mockNotifications = [
  {
    id: 'notif-1',
    recipientId: 'admin-1',
    sender: { name: 'John Doe' },
    type: 'ATTENDANCE_SUBMITTED',
    message: 'John Doe submitted attendance for Grade 8 Mathematics.',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: 'notif-2',
    recipientId: 'admin-1',
    sender: { name: 'Jane Smith' },
    type: 'EVENT_CREATED',
    message: 'Jane Smith created a new event: Parent-Teacher Meetings.',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
];

/**
 * Creates a new notification and adds it to the store.
 * @param {object} notification - The notification to create.
 * @returns {Promise<object>} The created notification.
 */
export const createNotification = async (notification) => {
  await mockApiDelay(300);
  const newNotification = {
    id: `notif-${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
    ...notification,
  };
  mockNotifications.unshift(newNotification); // Add to the top of the list
  console.log('Created Notification:', newNotification);
  return newNotification;
};

/**
 * Fetches all notifications for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A list of notifications.
 */
export const getNotificationsForUser = async (userId) => {
  await mockApiDelay(600);
  const userNotifications = mockNotifications.filter(n => n.recipientId === userId);
  console.log(`Fetched ${userNotifications.length} notifications for user ${userId}`);
  return userNotifications;
};

/**
 * Marks a single notification as read.
 * @param {string} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<{success: boolean}>}
 */
export const markNotificationAsRead = async (notificationId) => {
  await mockApiDelay(200);
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    console.log(`Marked notification ${notificationId} as read.`);
    return { success: true };
  }
  return { success: false };
};

/**
 * Marks all notifications for a user as read.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{success: boolean}>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  await mockApiDelay(400);
  mockNotifications.forEach(n => {
    if (n.recipientId === userId) {
      n.read = true;
    }
  });
  console.log(`Marked all notifications for user ${userId} as read.`);
  return { success: true };
};

// Export a singleton instance
export const notificationService = new NotificationService();
