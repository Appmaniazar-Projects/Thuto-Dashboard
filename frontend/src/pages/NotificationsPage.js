// src/pages/NotificationsPage.js
//
// Full-page Notification Centre at /notifications (linked from the bell's
// "View all"). Shows every active notification, untruncated, with an
// All / Unread filter. Uses the same context and list as the dropdown.

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Tab, Tabs, Typography, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import NotificationList from '../components/notifications/NotificationList';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const {
    enabled,
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    isPending,
    fetchNotifications,
    refresh,
    markAsRead,
    expireNotification,
  } = useNotifications();

  // Card 5: fetch when the notification view opens (skipped if data is still fresh)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!enabled) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Alert severity="info">Notifications are not available for your account type.</Alert>
      </Box>
    );
  }

  const shown = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">Notifications</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : 'Updates from your school'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={refresh}
          disabled={loading || refreshing}
        >
          Refresh
        </Button>
      </Box>

      {error && notifications.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Couldn't refresh notifications. Showing the last loaded list. ({error})
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Tabs
          value={filter}
          onChange={(_, value) => setFilter(value)}
          sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
          aria-label="Filter notifications"
        >
          <Tab value="all" label={`All (${notifications.length})`} />
          <Tab value="unread" label={`Unread (${unreadCount})`} />
        </Tabs>

        <NotificationList
          notifications={shown}
          loading={loading}
          error={error}
          onRetry={refresh}
          isPending={isPending}
          onMarkRead={markAsRead}
          onExpire={expireNotification}
          variant="light"
          emptyTitle={filter === 'unread' && notifications.length > 0 ? 'No unread notifications' : "You're all caught up"}
          emptyMessage={filter === 'unread' && notifications.length > 0 ? 'Everything here has been read.' : 'You have no active notifications.'}
        />
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
