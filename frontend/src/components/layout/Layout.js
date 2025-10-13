import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { APP_TEXT } from '../../utils/appText';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const rawPath = location.pathname.split('/').filter(Boolean).pop();
  const pageTitle = rawPath?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || APP_TEXT.DASHBOARD_TITLE;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TopBar 
        drawerWidth={open ? 240 : 72}
        handleDrawerToggle={handleDrawerToggle}
        title={pageTitle}
        sidebarOpen={open}
      />

      <Sidebar 
        open={open}
        setOpen={setOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        title={open ? pageTitle : ''}
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
          marginLeft: !isMobile ? `${SIDEBAR_WIDTH}px` : 0,
          width: !isMobile ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
          paddingTop: '64px', // For TopBar
        }}
      >
        <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
          <Outlet />
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
