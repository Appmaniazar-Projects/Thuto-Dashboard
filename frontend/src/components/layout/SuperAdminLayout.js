import React, { useState } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import LogoImage from '../../assets/Logo_Dashboard.png';

const SIDEBAR_WIDTH = 240;

const SuperAdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sidebarWidth={SIDEBAR_WIDTH}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `${SIDEBAR_WIDTH}px` },
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          backgroundColor: theme.palette.background.default,
          paddingTop: '64px',
        }}
      >
        <TopBar
          src={LogoImage}
          isSuperAdmin={true}
          logoAsImage={true}
          onTitleClick={() => navigate('/superadmin/dashboard')}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
          <Outlet />
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;