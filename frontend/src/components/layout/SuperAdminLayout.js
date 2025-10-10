import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';

const SuperAdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/superadmin/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TopBar 
        title="Thuto Dashboard" 
        isSuperAdmin={true} 
        onTitleClick={handleTitleClick}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          width: '100%',
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

export default SuperAdminLayout;
