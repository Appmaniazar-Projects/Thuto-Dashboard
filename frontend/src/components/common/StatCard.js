import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
    <Box>
      <Typography variant="h5" fontWeight="bold">
        {value === 'Error' ? <ErrorIcon color="error" /> : (value ?? '...')}
      </Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
    <Avatar sx={{ bgcolor: value === 'Error' ? 'error.main' : `${color}.main`, color: 'white' }}>
      {icon}
    </Avatar>
  </Paper>
);

export default StatCard;
