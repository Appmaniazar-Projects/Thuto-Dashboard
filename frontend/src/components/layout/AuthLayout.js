import React from 'react';
import { Box, CssBaseline, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { APP_CONFIG } from '../../config/appConfig';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const LogoContainer = styled(Box)({
  textAlign: 'center',
  marginBottom: 32,
});

const ContentContainer = styled(Box)({
  maxWidth: 448,
  margin: '0 auto',
  width: '100%',
});

const AuthLayout = ({ children, title }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <StyledContainer component="main" maxWidth={false}>
        <ContentContainer>
          <LogoContainer>
            {title && (
              <Typography variant="h5" component="h2" mt={2}>
                {title}
              </Typography>
            )}
          </LogoContainer>
          {children}
        </ContentContainer>
      </StyledContainer>
    </Box>
  );
};

export default AuthLayout;
