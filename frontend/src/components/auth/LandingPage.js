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
        py: { xs: 3, md: 4 }
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: 3 }}>
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '70px' : '90px',
                width: 'auto'
              }}
            />
          </Box>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Divider sx={{ maxWidth: '150px', mx: 'auto', mb: 3 }} />
          
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.5
            }}
          >
            Choose your access type to continue
          </Typography>
        </Box>

        {/* Role Selection Section */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: '100%' }}>
            {userTypes.map((userType, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: { xs: 2, md: 2.5 },
                  textAlign: 'center',
                  border: `2px solid ${theme.palette.grey[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  width: '100%',
                  '&:hover': {
                    borderColor: userType.color,
                    boxShadow: `0 6px 20px rgba(0,0,0,0.08)`,
                    transform: 'translateY(-2px)',
                    '& .role-icon': {
                      transform: 'scale(1.05)'
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
                      mb: 2,
                      transition: 'transform 0.3s ease-in-out',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '50px'
                    }}
                  >
                    {userType.icon}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 3,
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      lineHeight: 1.4
                    }}
                  >
                    {userType.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<ArrowIcon className="arrow-icon" sx={{ transition: 'transform 0.3s ease-in-out' }} />}
                    sx={{
                      backgroundColor: userType.color,
                      color: 'white',
                      py: { xs: 1.2, md: 1.5 },
                      px: 4,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: { xs: '0.95rem', md: '1rem' },
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
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: { xs: 4, md: 5 }, pt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.disabled,
              fontSize: { xs: '0.8rem', md: '0.85rem' }
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