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
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as StudentIcon,
  FamilyRestroom as ParentIcon,
  MenuBook as TeacherIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowForwardIcon
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
      icon: <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
        <StudentIcon sx={{ fontSize: 48, color: '#667eea' }} />
        <ParentIcon sx={{ fontSize: 48, color: '#f093fb' }} />
        <TeacherIcon sx={{ fontSize: 48, color: '#4facfe' }} />
      </Box>,
      path: '/login',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonText: 'Continue to Login'
    },
    {
      title: 'School Administrators',
      description: 'Manage school operations, user accounts, and system settings',
      icon: <AdminIcon sx={{ fontSize: 64, color: '#f093fb' }} />,
      path: '/admin/login',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.3), transparent 50%)',
          animation: 'pulse 15s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          {/* Logo */}
          <Box 
            sx={{ 
              mb: 3,
              animation: 'fadeInDown 1s ease-out'
            }}
          >
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '70px' : '90px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                dropShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            />
          </Box>
          
          {/* Welcome Text */}
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 4px 8px rgba(0,0,0,0.4)',
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            sx={{
              color: 'rgba(255,255,255,0.95)',
              mb: 2,
              fontWeight: 500,
              textShadow: '1px 2px 4px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Divider 
            sx={{ 
              maxWidth: '100px', 
              mx: 'auto', 
              my: 3, 
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 2,
              animation: 'fadeIn 1s ease-out 0.6s both'
            }} 
          />
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '650px',
              mx: 'auto',
              fontSize: isMobile ? '1rem' : '1.15rem',
              lineHeight: 1.7,
              animation: 'fadeInUp 1s ease-out 0.8s both'
            }}
          >
            Choose your access type to continue to your personalized dashboard
          </Typography>
        </Box>

        {/* Role Selection Cards */}
        <Grid container spacing={3} justifyContent="center">
          {userTypes.map((userType, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6} 
              key={index}
              sx={{
                animation: `fadeInUp 1s ease-out ${1 + index * 0.2}s both`
              }}
            >
              <Card
                elevation={8}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: userType.gradient,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    '& .role-icon': {
                      transform: 'scale(1.15) rotate(5deg)'
                    },
                    '& .access-button': {
                      background: userType.gradient,
                      transform: 'scale(1.05)'
                    }
                  },
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
                    p: 4,
                    pb: 2
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: 3,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
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
                      background: userType.gradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: isMobile ? '1.3rem' : '1.5rem'
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: isMobile ? '0.95rem' : '1.05rem',
                      lineHeight: 1.7,
                      mb: 3
                    }}
                  >
                    {userType.description}
                  </Typography>
                  
                  <Button
                    className="access-button"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: userType.gradient,
                      color: 'white',
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
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

        {/* Footer */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 8,
            animation: 'fadeIn 1s ease-out 1.5s both'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            2025 Thuto Educational Management System
          </Typography>
        </Box>
      </Container>
      
      {/* Add keyframes for animations */}
      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LandingPage;