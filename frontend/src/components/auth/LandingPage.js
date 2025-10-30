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
  useTheme,
  useMediaQuery,
  Stack,
  Chip
} from '@mui/material';
import {
  School as StudentIcon,
  FamilyRestroom as ParentIcon,
  MenuBook as TeacherIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import Logo from '../../assets/Logo.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const userTypes = [
    {
      title: 'Students, Parents & Teachers',
      description: 'Access your personalized educational dashboard',
      features: ['View Attendance', 'Track Progress', 'Access Resources', 'View Reports'],
      icon: <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center' }}>
        <StudentIcon sx={{ fontSize: 40, color: '#667eea' }} />
        <ParentIcon sx={{ fontSize: 40, color: '#f093fb' }} />
        <TeacherIcon sx={{ fontSize: 40, color: '#4facfe' }} />
      </Box>,
      path: '/login',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonText: 'Continue to Login',
      color: '#667eea'
    },
    {
      title: 'School Administrators',
      description: 'Complete control over school operations',
      features: ['Manage Users', 'System Settings', 'Reports & Analytics', 'School Operations'],
      icon: <AdminIcon sx={{ fontSize: 56, color: '#f093fb' }} />,
      path: '/admin/login',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      buttonText: 'Admin Access',
      color: '#f093fb'
    }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 25%, #2c5364 50%, #667eea 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 20%, rgba(102, 126, 234, 0.15), transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(240, 147, 251, 0.15), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.1), transparent 50%)
          `,
          animation: 'pulse 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'moveBackground 60s linear infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        '@keyframes moveBackground': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          {/* Logo */}
          <Box 
            sx={{ 
              mb: 3,
              animation: 'fadeInDown 1s ease-out',
              display: 'inline-block',
              p: 2,
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '60px' : '80px',
                width: 'auto',
                filter: 'brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            />
          </Box>
          
          {/* Welcome Text */}
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 1s ease-out 0.2s both',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 3,
              fontWeight: 400,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Box
            sx={{
              display: 'inline-block',
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'fadeIn 1s ease-out 0.6s both',
              mb: 2
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                fontWeight: 500,
              }}
            >
              Choose your access type to get started
            </Typography>
          </Box>
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
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: userType.gradient,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: userType.gradient,
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 25px 50px -12px ${userType.color}40`,
                    border: `1px solid ${userType.color}60`,
                    '&::after': {
                      opacity: 0.05,
                    },
                    '& .role-icon': {
                      transform: 'scale(1.1) translateY(-5px)'
                    },
                    '& .access-button': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${userType.color}50`,
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
                    p: { xs: 3, md: 4 },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: 3,
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      borderRadius: '24px',
                      background: `linear-gradient(135deg, ${userType.color}15, ${userType.color}05)`,
                      border: `2px solid ${userType.color}30`,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '24px',
                        padding: '2px',
                        background: userType.gradient,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0.5,
                      }
                    }}
                  >
                    {userType.icon}
                  </Box>
                  
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: 'white',
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      lineHeight: 1.6,
                      mb: 3
                    }}
                  >
                    {userType.description}
                  </Typography>
                  
                  {/* Features List */}
                  <Stack spacing={1} sx={{ mb: 3, width: '100%' }}>
                    {userType.features.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.9rem'
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 18, color: userType.color }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  
                  <Button
                    className="access-button"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: userType.gradient,
                      color: 'white',
                      py: { xs: 1.5, md: 1.75 },
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      borderRadius: 3,
                      boxShadow: `0 8px 20px ${userType.color}40`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        boxShadow: `0 12px 30px ${userType.color}60`,
                        transform: 'translateY(-2px)',
                        '&::before': {
                          left: '100%',
                        }
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
            mt: { xs: 6, md: 8 },
            animation: 'fadeIn 1s ease-out 1.5s both'
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              2025 Thuto Educational Management System
            </Typography>
          </Box>
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