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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const userTypes = [
    {
      title: isMobile ? 'Students, Parents & Teachers' : 'Students, Parents & Teachers',
      description: 'Access your personalized educational dashboard',
      features: ['View Attendance', 'Track Progress', 'Access Resources', 'View Reports'],
      icon: (
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <StudentIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: theme.palette.primary.main }} />
          <ParentIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: theme.palette.secondary.main }} />
          <TeacherIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: theme.palette.primary.dark }} />
        </Box>
      ),
      path: '/login',
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      buttonText: isMobile ? 'Login' : 'Continue to Login',
      color: theme.palette.primary.main
    },
    {
      title: isMobile ? 'Administrators' : 'School Administrators',
      description: 'Complete control over school operations',
      features: ['Manage Users', 'System Settings', 'Reports & Analytics', 'School Operations'],
      icon: <AdminIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 }, color: theme.palette.secondary.main }} />,
      path: '/admin/login',
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark || theme.palette.secondary.main} 100%)`,
      buttonText: isMobile ? 'Admin Login' : 'Admin Access',
      color: theme.palette.secondary.main
    }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        m: 0,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'none',
        },
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100% !important',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 2, md: 3 }, 
          maxWidth: 'none', 
          width: '100%',
          px: 0,
          pt: { xs: 3, sm: 4 },
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <Box
            sx={{
              mb: { xs: 1, sm: 2 },
              animation: 'fadeInDown 1s ease-out',
              display: 'inline-block',
              p: { xs: 1, sm: 1.5 },
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(25, 118, 210, 0.15)',
              maxWidth: '100%',
              boxSizing: 'border-box',
              mt: { xs: 2, sm: 3 }
            }}
          >
            <img
              src={Logo}
              alt="Thuto"
              style={{
                height: isMobile ? '40px' : (isTablet ? '50px' : '60px'),
                width: 'auto',
                maxWidth: '100%',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))',
              }}
            />
          </Box>
          
          {/* Welcome Text */}
          <Typography
            variant={isMobile ? 'h5' : (isTablet ? 'h4' : 'h3')}
            component="h1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 800,
              mb: { xs: 1, sm: 1.5 },
              textShadow: '0 2px 10px rgba(0,0,0,0.08)',
              animation: 'fadeInUp 1s ease-out 0.2s both',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              px: { xs: 1, sm: 0 },
              textAlign: 'center',
              wordBreak: 'break-word',
              fontSize: {
                xs: '1.75rem',
                sm: '2.125rem',
                md: '3rem'
              }
            }}
          >
            Welcome to Thuto
          </Typography>
          
          <Typography
            variant={isMobile ? 'body2' : (isTablet ? 'body1' : 'h6')}
            sx={{
              color: theme.palette.text.secondary,
              mb: { xs: 1.5, sm: 2 },
              fontWeight: 400,
              textShadow: '0 1px 6px rgba(0,0,0,0.06)',
              animation: 'fadeInUp 1s ease-out 0.4s both',
              textAlign: 'center',
              px: { xs: 1, sm: 0 },
              fontSize: {
                xs: '0.875rem',
                sm: '1rem',
                md: '1.25rem'
              },
              lineHeight: 1.4
            }}
          >
            Educational Management Platform
          </Typography>
          
          <Box
            sx={{
              display: 'inline-block',
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              animation: 'fadeIn 1s ease-out 0.6s both',
              mb: { xs: 1, sm: 1.5 },
              maxWidth: '90%',
              mx: 'auto',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                display: 'inline-block'
              }}
            >
              Choose your access type to get started
            </Typography>
          </Box>
        </Box>

        {/* Role Selection Cards */}
       <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }} 
            justifyContent="center" 
            alignItems="stretch"
            sx={{ 
              px: { xs: 2, sm: 3, md: 6 },
              pb: { xs: 1, sm: 2, md: 3 },
              width: '100%',
              boxSizing: 'border-box',
              flex: '1 0 auto',
            }}
          >
        
          {userTypes.map((userType, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6} 
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                animation: `fadeInUp 1s ease-out ${1 + index * 0.2}s both`
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${userType.color}40`,
                    borderColor: `${userType.color}40`,
                  },
                  '@media (hover: none)': {
                    '&:hover': {
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                      boxShadow: `0 8px 16px ${userType.color}30`,
                    }
                  },
                  animation: `fadeIn 0.6s ease-out ${index * 0.2 + 0.4}s both`,
                }}
                onClick={() => handleRoleSelect(userType.path)}
              >
                <CardContent
                  sx={{
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: { xs: 2, sm: 3 },
                    '&:last-child': {
                      pb: { xs: 2, sm: 3 }
                    }
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: '50%',
                      background: `${userType.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'fit-content',
                      mx: 'auto',
                      '& svg': {
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover svg': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {userType.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{
                      mb: { xs: 0.75, sm: 1 },
                      fontWeight: 700,
                      background: userType.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      fontSize: { 
                        xs: '1rem', 
                        sm: '1.1rem', 
                        md: '1.25rem' 
                      },
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      width: '100%'
                    }}
                  >
                    {userType.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                      lineHeight: 1.5,
                      mb: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      px: { xs: 1, sm: 0 },
                      wordBreak: 'break-word',
                      width: '100%'
                    }}
                  >
                    {userType.description}
                  </Typography>
                  <Stack spacing={0.75} sx={{ mb: { xs: 1.5, sm: 2 }, width: '100%' }}>
                    {userType.features.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          color: theme.palette.text.secondary,
                          fontSize: { xs: '0.75rem', sm: '0.85rem' }
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 16, color: userType.color }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 'auto',
                      background: userType.gradient,
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      py: { xs: 1, sm: 1.25 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '&:hover': {
                        boxShadow: `0 4px 20px ${userType.color}80`,
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      transition: 'all 0.2s ease',
                      '@media (hover: none)': {
                        '&:hover': {
                          transform: 'none',
                          boxShadow: 'none',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                          boxShadow: `0 2px 10px ${userType.color}60`,
                        },
                      },
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
            mb: { xs: 2, md: 3 }, 
            maxWidth: 'none', 
            width: '100%',
            pt: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 2.5,
              py: 1,
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
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