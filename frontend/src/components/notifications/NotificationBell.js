import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tooltip title="Notifications coming soon">
      <IconButton color="inherit" aria-label="notifications">
        <Badge badgeContent={0} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
