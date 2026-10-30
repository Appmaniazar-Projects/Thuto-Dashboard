// src/components/notifications/NotificationBell.js
//
// Bell icon + unread badge + dropdown, shown in the TopBar for roles that
// receive notifications (see NOTIFICATION_CONFIG.ROLES). Styled to match the
// existing dark TopBar menus.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Divider, IconButton, Popover, Tooltip, Typography, CircularProgress } from '@mui/material';
import { Notifications as NotificationsIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_CONFIG } from '../../config/appConfig';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
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

  if (!enabled) return null;

  const open = Boolean(anchorEl);
  const visible = notifications.slice(0, NOTIFICATION_CONFIG.DROPDOWN_LIMIT);
  const hiddenCount = notifications.length - visible.length;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // stale-aware: only calls GET if data is older than STALE_AFTER_MS
  };

  const handleClose = () => setAnchorEl(null);

  const handleViewAll = () => {
    handleClose();
    navigate('/notifications');
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{ mr: 1, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 380,
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            color: '#f9fafb',
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>{unreadCount} unread</Typography>
            )}
          </Box>
          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" onClick={refresh} disabled={loading || refreshing} aria-label="Refresh notifications" sx={{ color: '#d1d5db' }}>
                {refreshing ? <CircularProgress size={16} sx={{ color: '#d1d5db' }} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Divider sx={{ borderColor: '#374151' }} />

        {/* Inline error when a refresh fails but older data is still shown */}
        {error && notifications.length > 0 && (
          <Typography variant="caption" sx={{ display: 'block', px: 2, py: 1, color: '#fca5a5', borderBottom: '1px solid #374151' }}>
            Couldn't refresh. Showing the last loaded notifications.
          </Typography>
        )}

        <Box sx={{ maxHeight: { xs: '60vh', sm: 420 }, overflowY: 'auto' }}>
          <NotificationList
            notifications={visible}
            loading={loading}
            error={error}
            onRetry={refresh}
            isPending={isPending}
            onMarkRead={markAsRead}
            onExpire={expireNotification}
            variant="dark"
            clampContent
          />
        </Box>

        <Divider sx={{ borderColor: '#374151' }} />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" onClick={handleViewAll} sx={{ color: '#93c5fd', textTransform: 'none' }}>
            {hiddenCount > 0 ? `View all notifications (${notifications.length})` : 'View all notifications'}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
