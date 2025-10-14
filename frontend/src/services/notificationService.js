// This service handles notifications with a simple mock implementation
const useWebSockets = false;

class NotificationService {
  constructor() {
    this.subscribers = new Set();
    this.isConnected = false;
    console.log('Notification service initialized (WebSockets disabled)');
  }

  // Mock connection method for API compatibility
  connect() {
    console.log('Notification service: WebSocket connection disabled in phase one');
    this.isConnected = false;
    return Promise.resolve();
  }

  // Mock disconnection method for API compatibility
  disconnect() {
    this.isConnected = false;
    return Promise.resolve();
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
  notifySubscribers(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Get notifications for a user (mock implementation)
  async getNotificationsForUser(userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data
    return [
      {
        id: 'notif-1',
        title: 'Welcome to Thuto Dashboard',
        message: 'Your account has been created successfully',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString(),
      }
    ];
  }

  // Mark notification as read (mock implementation)
  async markAsRead(notificationId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }

  // Mark all notifications as read (mock implementation)
  async markAllAsRead(userId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();


export default notificationService;
