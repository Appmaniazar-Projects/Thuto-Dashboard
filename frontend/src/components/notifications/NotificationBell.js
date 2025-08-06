import React, { useState, useRef, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Box,
  Button,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Email as EmailIcon,
  Announcement as AnnouncementIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const popoverRef = useRef(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id, event) => {
    event.stopPropagation();
    markAsRead(id);
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click (e.g., navigate to message)
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Add navigation logic here
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <EmailIcon color="primary" />;
      case 'announcement':
        return <AnnouncementIcon color="warning" />;
      case 'system':
        return <CheckCircleIcon color="info" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getNotificationText = (notification) => {
    const { type, metadata } = notification;
    
    switch (type) {
      case 'new_message':
        return `New message from ${metadata?.sender || 'a user'}`;
      case 'announcement':
        return 'New announcement available';
      case 'system':
        return 'System notification';
      default:
        return notification.message;
    }
  };

  // Sort notifications with unread first, then by date
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return a.read ? 1 : -1;
  });

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleClick}
          ref={popoverRef}
          aria-label={`show ${unreadCount} new notifications`}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                startIcon={<MarkEmailReadIcon />}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                color="error"
                sx={{ ml: 1 }}
              >
                Clear all
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        <List sx={{ p: 0 }}>
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'background.paper' : 'action.hover',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderLeft: notification.read ? 'none' : '3px solid',
                    borderColor: 'primary.main',
                    pl: notification.read ? 2 : '9px',
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        component="div"
                        sx={{ fontWeight: notification.read ? 'normal' : 'medium' }}
                      >
                        {getNotificationText(notification)}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  {!notification.read && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      sx={{ ml: 1 }}
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsOffIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll notify you when something new arrives
              </Typography>
            </Box>
          )}
        </List>

        {notifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button size="small" onClick={clearAll}>
              Clear all notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
