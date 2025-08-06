import React, { useState } from 'react';
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
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import LogoutIcon from '@mui/icons-material/Logout';

const TopBar = ({ drawerWidth, handleDrawerToggle, title, sidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you would update the theme here
    // theme.palette.mode = darkMode ? 'light' : 'dark';
  };

  const menuId = 'primary-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#1f2937',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
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
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Dark/Light Mode Toggle */}
          {/* <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{ mr: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
           */}
          {/* Messages */}
          <Tooltip title="Messages">
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/messages')}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <NotificationBell />
          
          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Tooltip title={user?.name || 'User Profile'}>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                aria-controls={menuId}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? 'true' : undefined}
              >
                {user?.photoURL ? (
                  <Avatar 
                    alt={user.name} 
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
                {user?.name || 'User'}
              </Typography>
            )}
          </Box>
        </Box>
      </Toolbar>
      
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{user?.name || 'User'}</Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>{user?.email || ''}</Typography>
        </Box>
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <MailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Messages</ListItemText>
          <Badge badgeContent={4} color="error" sx={{ mr: 1 }} />
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
          <Badge badgeContent={3} color="error" sx={{ mr: 1 }} />
        </MenuItem>
        
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
