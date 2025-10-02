import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useSchoolBranding } from '../../context/SchoolBrandingContext';

/**
 * SchoolLogo component that displays the school's logo or fallback
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the logo (default: 40)
 * @param {boolean} props.showName - Whether to show school name (default: false)
 * @param {string} props.variant - Display variant: 'sidebar', 'header', 'login' (default: 'sidebar')
 */
const SchoolLogo = ({ size = 40, showName = false, variant = 'sidebar' }) => {
  const { branding } = useSchoolBranding();

  const getLogoStyles = () => {
    switch (variant) {
      case 'header':
        return {
          width: size,
          height: size,
          bgcolor: 'primary.main',
          color: 'white'
        };
      case 'login':
        return {
          width: size,
          height: size,
          bgcolor: 'primary.main',
          color: 'white',
          mb: 2
        };
      case 'sidebar':
      default:
        return {
          width: size,
          height: size,
          bgcolor: 'primary.main',
          color: 'white'
        };
    }
  };

  const renderLogo = () => {
    if (branding.logo) {
      return (
        <Avatar
          src={branding.logo}
          alt={branding.schoolName || 'School Logo'}
          sx={getLogoStyles()}
        />
      );
    }

    // Fallback to school icon with school colors
    return (
      <Avatar sx={getLogoStyles()}>
        <SchoolIcon />
      </Avatar>
    );
  };

  if (showName) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: variant === 'login' ? 0 : 2,
          flexDirection: variant === 'login' ? 'column' : 'row'
        }}
      >
        {renderLogo()}
        <Typography 
          variant={variant === 'login' ? 'h5' : 'h6'} 
          component="div"
          sx={{ 
            color: variant === 'sidebar' ? 'white' : 'inherit',
            fontWeight: variant === 'login' ? 'bold' : 'normal'
          }}
        >
          {branding.schoolName || 'Thuto Dashboard'}
        </Typography>
      </Box>
    );
  }

  return renderLogo();
};

export default SchoolLogo;
