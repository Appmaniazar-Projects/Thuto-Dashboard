import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
  Card,
  CardContent
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 3, md: 4 }
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: 3 }}>
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '70px' : '90px',
                width: 'auto',
                filter: 'brightness(0) invert(1)' // Make logo white
              }}
            />
          </Box>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Divider sx={{ maxWidth: '150px', mx: 'auto', mb: 3, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Choose your access type to continue to your personalized dashboard
          </Typography>
        </Box>

        {/* Role Selection Section */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {userTypes.map((userType, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Card
                  elevation={8}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      background: 'rgba(255, 255, 255, 1)',
                      '& .role-icon': {
                        transform: 'scale(1.1)'
                      },
                      '& .access-button': {
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                  onClick={() => handleRoleSelect(userType.path)}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      className="role-icon"
                      sx={{
                        mb: 3,
                        transition: 'transform 0.3s ease-in-out',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '80px'
                      }}
                    >
                      {userType.icon}
                    </Box>
                    
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.3rem', md: '1.5rem' }
                      }}
                    >
                      {userType.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 4,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        lineHeight: 1.6,
                        flex: 1
                      }}
                    >
                      {userType.description}
                    </Typography>
                    
                    <Button
                      className="access-button"
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<ArrowIcon />}
                      sx={{
                        backgroundColor: userType.color,
                        color: 'white',
                        py: { xs: 1.5, md: 2 },
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        borderRadius: 2,
                        boxShadow: `0 4px 15px ${userType.color}40`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: userType.color,
                          filter: 'brightness(0.9)',
                          boxShadow: `0 6px 20px ${userType.color}60`
                        }
                      }}
                    >
                      {userType.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: { xs: 4, md: 6 }, pt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.85rem', md: '0.9rem' }
            }}
          >
            © 2025 Thuto Educational Management System
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;