import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { APP_TEXT } from '../../utils/appText';

const SIDEBAR_WIDTH = 240;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Changed from 'md' to 'sm' to match TopBar
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Add tablet detection
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const rawPath = location.pathname.split('/').filter(Boolean).pop();
  const pageTitle =
    rawPath?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ||
    APP_TEXT.DASHBOARD_TITLE;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TopBar
        drawerWidth={SIDEBAR_WIDTH}
        handleDrawerToggle={handleDrawerToggle}
        title={pageTitle}
      />

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sidebarWidth={SIDEBAR_WIDTH}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0, // Remove dynamic margin to fix white space issue
          width: '100%',
          paddingTop: '64px',
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            py: isTablet ? 2 : 4, // Reduce padding on tablet
            px: isTablet ? 2 : 4   // Reduce padding on tablet
          }}
        >
          <Outlet />
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;

