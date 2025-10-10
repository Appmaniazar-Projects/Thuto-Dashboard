import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  useMediaQuery,
  useTheme,
  ListItemText,
  List,
  ListItem,
  Divider,
  Button,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  MarkChatRead as MarkChatReadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const TopBar = ({ drawerWidth, handleDrawerToggle, title, sidebarOpen, isSuperAdmin = false, onTitleClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications for admin user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.role === 'admin') {
        const userNotifications = await notificationService.getNotificationsForUser(user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      }
    };

    fetchNotifications();
    // Optional: Set up polling to refresh notifications periodically
    const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfile = () => {
    handleMenuClose();
    
    // Navigate to role-specific profile page
    const isSuperAdmin = user?.role === 'superadmin' || 
                       user?.level === 'national' || 
                       user?.level === 'provincial' ||
                       ['superadmin', 'superadmin_national', 'superadmin_provincial'].includes(user?.role);
    
    if (isSuperAdmin) {
      navigate('/superadmin/profile');
    } else {
      navigate('/profile');
    }
  };
  
  const handleSettings = () => {
    handleMenuClose();
    
    // Navigate to role-specific settings page
    const isSuperAdmin = user?.role === 'superadmin' || 
                       user?.level === 'national' || 
                       user?.level === 'provincial' ||
                       ['superadmin', 'superadmin_national', 'superadmin_provincial'].includes(user?.role);
    
    if (isSuperAdmin) {
      navigate('/superadmin/settings');
    } else {
      navigate('/settings');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await notificationService.markNotificationAsRead(notificationId);
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllNotificationsAsRead(user.id);
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    handleNotificationsClose();
  };

  const menuId = 'primary-account-menu';
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isSuperAdmin ? '100%' : { sm: `calc(100% - ${drawerWidth}px)` },
        ml: isSuperAdmin ? 0 : { sm: `${drawerWidth}px` },
        backgroundColor: '#1f2937',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        {!isSuperAdmin && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          onClick={onTitleClick}
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.5px',
            marginLeft:'10px',
            cursor: onTitleClick ? 'pointer' : 'default',
            '&:hover': onTitleClick ? {
              opacity: 0.8
            } : {}
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* Notifications */}
          {user && user.role === 'admin' && (
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationsOpen}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Tooltip title={`${user?.name || 'User'} ${user?.lastName || ''}`.trim() || 'User Profile'}>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                aria-controls={menuId}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                {user?.photoURL ? (
                  <Avatar 
                    alt={`${user?.name || ''} ${user?.lastName || ''}`.trim()} 
                    src={user.photoURL} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.name?.charAt(0) || <AccountCircle />}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {`${user?.name || 'User'} ${user?.lastName || ''}`.trim()}
              </Typography>
            )}
          </Box>
        </Box>
      </Toolbar>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={isNotificationsOpen}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: '90vw',
            mt: 1.5,
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            color: '#f9fafb',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} startIcon={<MarkChatReadIcon />}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: '#374151' }} />
        <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
          {notifications.length > 0 ? notifications.map(notification => (
            <ListItem 
              key={notification.id}
              button 
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{
                backgroundColor: !notification.read ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderBottom: '1px solid #374151',
              }}
            >
              <ListItemText
                primary={notification.message}
                secondary={formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                primaryTypographyProps={{ fontWeight: !notification.read ? 'bold' : 'normal' }}
                secondaryTypographyProps={{ color: '#9ca3af' }}
              />
            </ListItem>
          )) : (
            <ListItem>
              <ListItemText primary="No new notifications" sx={{ textAlign: 'center', color: '#9ca3af' }} />
            </ListItem>
          )}
        </List>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 240,
            overflow: 'visible',
            mt: 1.5,
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            color: '#f9fafb',
            '& .MuiMenuItem-root': {
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
            '& .MuiDivider-root': {
              borderColor: '#374151',
              my: 1,
            },
            '& .MuiSvgIcon-root': {
              color: '#9ca3af',
              fontSize: 20,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              backgroundColor: '#1f2937',
              borderTop: '1px solid #374151',
              borderLeft: '1px solid #374151',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #374151' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {`${user?.name || 'User'} ${user?.lastName || ''}`.trim()}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>{user?.email || ''}</Typography>
        </Box>
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

          {/* Messages/Settings - Role-based */}
          {(() => {
            // Check if user is any type of superadmin
            const isSuperAdmin = user?.role === 'superadmin' || 
                              user?.level === 'national' || 
                              user?.level === 'provincial' ||
                              ['superadmin', 'superadmin_national', 'superadmin_provincial'].includes(user?.role);
            
            return isSuperAdmin ? (
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem onClick={() => navigate('/messages')}>
                <ListItemIcon>
                  <MailIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Messages</ListItemText>
                <Badge badgeContent={0} color="error" sx={{ mr: 1 }} />
              </MenuItem>
            );
          })()}
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default TopBar;
