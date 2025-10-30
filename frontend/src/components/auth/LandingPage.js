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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
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
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {userTypes.map((userType, index) => (
            <Grid 
              item 
              xs={12} 
              sm={12} 
              md={6} 
              lg={6}
              key={index}
              sx={{
                animation: `fadeInUp 1s ease-out ${1 + index * 0.2}s both`,
                display: 'flex'
              }}
            >
              <Card
                elevation={8}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: { xs: '320px', sm: '360px', md: '400px' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: userType.gradient,
                    animation: 'shimmer 3s ease-in-out infinite',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, transparent 0%, ${userType.gradient.split('(')[1].split(')')[0].split(',')[0].trim()} 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                  },
                  '&:hover': {
                    transform: { xs: 'translateY(-4px)', md: 'translateY(-12px) scale(1.03)' },
                    boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&::after': {
                      opacity: 0.05,
                    },
                    '& .role-icon': {
                      transform: { xs: 'scale(1.1)', md: 'scale(1.2) rotate(8deg)' },
                      '& svg': {
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      }
                    },
                    '& .access-button': {
                      background: userType.gradient,
                      transform: { xs: 'scale(1.02)', md: 'scale(1.08)' },
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                    '& .card-title': {
                      transform: 'scale(1.05)',
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
                    p: { xs: 3, sm: 4, md: 5 },
                    pb: { xs: 2, sm: 3 },
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: { xs: 2, sm: 3 },
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: { xs: '70px', sm: '80px', md: '100px' },
                      width: { xs: '100px', sm: '120px', md: '140px' },
                      height: { xs: '100px', sm: '120px', md: '140px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: { xs: 2, sm: 3 },
                      borderRadius: '50%',
                      background: userType.gradient,
                      opacity: 0.15,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '50%',
                        background: userType.gradient,
                        opacity: 0.2,
                        filter: 'blur(10px)',
                        animation: 'pulse 2s ease-in-out infinite',
                      },
                      '& > *': {
                        position: 'relative',
                        zIndex: 1,
                      }
                    }}
                  >
                    {userType.icon}
                  </Box>
                  
                  <Typography
                    className="card-title"
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mb: { xs: 1.5, sm: 2 },
                      background: userType.gradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.6rem' },
                      transition: 'transform 0.3s ease',
                      lineHeight: 1.3
                    }}
                  >
                    {userType.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      lineHeight: { xs: 1.6, md: 1.8 },
                      mb: { xs: 3, sm: 4 },
                      px: { xs: 0, sm: 1, md: 2 },
                      fontWeight: 400
                    }}
                  >
                    {userType.description}
                  </Typography>
                  
                  <Button
                    className="access-button"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForwardIcon sx={{ 
                      transition: 'transform 0.3s ease',
                      '.access-button:hover &': {
                        transform: 'translateX(4px)'
                      }
                    }} />}
                    sx={{
                      background: userType.gradient,
                      color: 'white',
                      py: { xs: 1.5, sm: 1.75, md: 2 },
                      px: { xs: 3, sm: 4 },
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                      borderRadius: { xs: 2, md: 3 },
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '0',
                        height: '0',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.6s, height 0.6s',
                      },
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        '&::before': {
                          width: '300px',
                          height: '300px',
                        }
                      },
                      '&:active': {
                        transform: 'scale(0.98)'
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
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.2;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.3;
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LandingPage;