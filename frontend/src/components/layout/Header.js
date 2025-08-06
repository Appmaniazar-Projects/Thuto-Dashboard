import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../context/AuthContext';
import { APP_TEXT } from '../../utils/appText';

const Header = ({ open, toggleDrawer }) => {
  const { currentUser } = useAuth();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{ marginRight: '36px' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          {APP_TEXT.SITE_NAME}
        </Typography>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        {currentUser ? (
          <Avatar sx={{ ml: 2, bgcolor: 'secondary.main' }}>
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </Avatar>
        ) : (
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;