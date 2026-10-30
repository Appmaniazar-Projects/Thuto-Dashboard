// Application configuration
export const APP_CONFIG = {
  SITE_NAME: 'Thuto Dashboard',
  // Add other app-wide configuration here
};

// Notification Centre settings (used by context/NotificationContext.js)
export const NOTIFICATION_CONFIG = {
  // Roles that receive in-app notifications (first release). Super admins are excluded.
  ROLES: ['admin', 'teacher', 'student', 'parent', 'guardian', 'sponsor', 'helper'],
  // Opening the bell / page reuses data fetched within this window instead of calling GET again.
  STALE_AFTER_MS: 30 * 1000,
  // Periodic polling is OFF for the first release (Card 5: page-load + action-based refresh).
  // Set to e.g. 60000 to poll every minute once the team agrees.
  POLL_INTERVAL_MS: 0,
  // Number of notifications shown in the top-bar dropdown before "View all".
  DROPDOWN_LIMIT: 8,
};
