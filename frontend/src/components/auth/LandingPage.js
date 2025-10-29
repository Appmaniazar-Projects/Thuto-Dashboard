import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as StudentIcon,
  FamilyRestroom as ParentIcon,
  MenuBook as TeacherIcon,
  AdminPanelSettings as AdminIcon
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
      icon: <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <StudentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        <ParentIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
        <TeacherIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
      </Box>,
      path: '/login',
      color: theme.palette.primary.main,
      buttonText: 'Login'
    },
    {
      title: 'Administrators',
      description: 'Manage school operations, user accounts, and system settings',
      icon: <AdminIcon sx={{ fontSize: 60, color: theme.palette.warning.main }} />,
      path: '/admin/login',
      color: theme.palette.warning.main,
      buttonText: 'Admin Login'
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
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '100px' : '140px',
                width: 'auto'
              }}
            />
          </Box>
          
          {/* Welcome Text */}
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Your Educational Management Platform
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
              fontSize: '1.1rem'
            }}
          >
            Please select your access type to continue to the appropriate dashboard
          </Typography>
        </Box>

        {/* Role Selection Cards */}
        <Grid container spacing={4} justifyContent="center">
          {userTypes.map((userType, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[20],
                    '& .role-icon': {
                      transform: 'scale(1.1)'
                    }
                  },
                  borderRadius: 4,
                  overflow: 'hidden',
                  minHeight: '320px'
                }}
                onClick={() => handleRoleSelect(userType.path)}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: 3,
                      transition: 'transform 0.3s ease-in-out',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {userType.icon}
                  </Box>
                  
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                      fontWeight: 'bold',
                      mb: 3,
                      color: userType.color,
                      fontSize: isMobile ? '1.5rem' : '2rem'
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {userType.description}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      backgroundColor: userType.color,
                      '&:hover': {
                        backgroundColor: userType.color,
                        filter: 'brightness(0.9)'
                      },
                      py: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      borderRadius: 2
                    }}
                  >
                    {userType.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              fontSize: '0.9rem'
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