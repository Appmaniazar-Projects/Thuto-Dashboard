import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  School as StudentIcon,
  FamilyRestroom as ParentIcon,
  MenuBook as TeacherIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import Logo from '../../assets/Logo.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const userTypes = [
    {
      title: 'Students, Parents & Teachers',
      description: 'Access your educational dashboard with subjects, resources, attendance, and reports',
      icon: <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center' }}>
        <StudentIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <ParentIcon sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
        <TeacherIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
      </Box>,
      path: '/login',
      color: theme.palette.primary.main,
      buttonText: 'Continue to Login'
    },
    {
      title: 'School Administrators',
      description: 'Manage school operations, user accounts, and system settings',
      icon: <AdminIcon sx={{ fontSize: 48, color: theme.palette.warning.main }} />,
      path: '/admin/login',
      color: theme.palette.warning.main,
      buttonText: 'Admin Access'
    }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Box sx={{ mb: 4 }}>
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '80px' : '100px',
                width: 'auto'
              }}
            />
          </Box>
          
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Divider sx={{ maxWidth: '200px', mx: 'auto', mb: 4 }} />
          
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: '500px',
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            Choose your access type to continue to your personalized dashboard
          </Typography>
        </Box>

        {/* Role Selection Section */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={4} justifyContent="center">
            {userTypes.map((userType, index) => (
              <Grid item xs={12} sm={6} md={5} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: `2px solid ${theme.palette.grey[200]}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: userType.color,
                      boxShadow: `0 8px 25px rgba(0,0,0,0.1)`,
                      transform: 'translateY(-4px)',
                      '& .role-icon': {
                        transform: 'scale(1.1)'
                      },
                      '& .arrow-icon': {
                        transform: 'translateX(4px)'
                      }
                    }
                  }}
                  onClick={() => handleRoleSelect(userType.path)}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: 3,
                      transition: 'transform 0.3s ease-in-out',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '60px'
                    }}
                  >
                    {userType.icon}
                  </Box>
                  
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1.3rem', md: '1.5rem' }
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 4,
                      flex: 1,
                      fontSize: '1rem',
                      lineHeight: 1.5
                    }}
                  >
                    {userType.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon className="arrow-icon" sx={{ transition: 'transform 0.3s ease-in-out' }} />}
                    sx={{
                      backgroundColor: userType.color,
                      color: 'white',
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: userType.color,
                        filter: 'brightness(0.9)',
                        boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
                      }
                    }}
                  >
                    {userType.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, pt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.disabled,
              fontSize: '0.9rem'
            }}
          >
            2025 Thuto Educational Management System
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;