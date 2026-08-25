// src/components/layout/Footer.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { APP_TEXT } from '../../utils/appText';

const Footer = () => {
  return (
    <Box sx={{ mt: 5, pt: 3, pb: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}{' '}
        <Link color="inherit" href="#">
          {APP_TEXT.SITE_NAME}
        </Link>
        {' | All rights reserved.'}
        {' | '}
        <Link color="inherit" href="/terms">
          Terms and Conditions
        </Link>
        {' | '}
        <Link color="inherit" href="/Thuto%20App%20Privacy%20Policy.pdf" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </Link>
        {' | '}
        <Link color="inherit" href="/PAIA-Manual.pdf" target="_blank" rel="noopener noreferrer">
          PAIA Manual
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;