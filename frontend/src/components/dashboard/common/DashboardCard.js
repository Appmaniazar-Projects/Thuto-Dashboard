import React from 'react';
import { Card, CardContent } from '@mui/material';

const DashboardCard = ({ children, sx, ...props }) => (
  <Card
    elevation={2}
    sx={{
      borderRadius: 3,
      boxShadow: 2,
      p: 2,
      ...sx,
    }}
    {...props}
  >
    <CardContent sx={{ p: 0 }}>
      {children}
    </CardContent>
  </Card>
);

export default DashboardCard; 