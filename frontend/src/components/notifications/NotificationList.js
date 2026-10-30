// src/components/notifications/NotificationList.js
//
// Renders a list of notifications plus the loading, error and empty states
// (Card 1 empty state, Card 2 loading/empty/error). Purely presentational:
// all data and actions come in through props from useNotifications().

import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { NotificationsNone as NotificationsNoneIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import NotificationItem from './NotificationItem';

const StateBox = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 1, px: 3, py: 5 }}>
    {children}
  </Box>
);

const NotificationList = ({
  notifications,
  loading,
  error,
  onRetry,
  isPending,
  onMarkRead,
  onExpire,
  variant = 'light',
  clampContent = false,
  emptyTitle = "You're all caught up",
  emptyMessage = 'You have no active notifications.',
}) => {
  const dark = variant === 'dark';
  const muted = dark ? '#9ca3af' : 'text.secondary';
  const text = dark ? '#f9fafb' : 'text.primary';

  if (loading && notifications.length === 0) {
    return (
      <StateBox>
        <CircularProgress size={28} sx={{ color: dark ? '#d1d5db' : undefined }} />
        <Typography variant="body2" sx={{ color: muted }}>Loading notifications…</Typography>
      </StateBox>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <StateBox>
        <Typography variant="body2" sx={{ color: text, fontWeight: 600 }}>Couldn't load notifications</Typography>
        <Typography variant="caption" sx={{ color: muted, maxWidth: 320 }}>{error}</Typography>
        {onRetry && (
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry} sx={{ mt: 1, ...(dark && { color: '#f9fafb', borderColor: '#4b5563' }) }}>
            Try again
          </Button>
        )}
      </StateBox>
    );
  }

  if (notifications.length === 0) {
    return (
      <StateBox>
        <NotificationsNoneIcon sx={{ fontSize: 44, color: muted }} />
        <Typography variant="body2" sx={{ color: text, fontWeight: 600 }}>{emptyTitle}</Typography>
        <Typography variant="caption" sx={{ color: muted }}>{emptyMessage}</Typography>
      </StateBox>
    );
  }

  return (
    <Box component="ul" role="list" sx={{ m: 0, p: 0 }}>
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          pending={isPending(n.id)}
          onMarkRead={onMarkRead}
          onExpire={onExpire}
          variant={variant}
          clampContent={clampContent}
        />
      ))}
    </Box>
  );
};

export default NotificationList;
