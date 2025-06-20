// src/components/layout/Footer.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ mt: 5, pt: 3, pb: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}{' '}
        <Link color="inherit" href="#">
          Cyber School Project
        </Link>
        {' | All rights reserved.'}
      </Typography>
    </Box>
  );
};

export default Footer;