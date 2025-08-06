// components/dashboard/admin/MessagesPanel.js
import React from 'react';
import { Paper, Typography } from '@mui/material';

const MessagesPanel = () => (
  <Paper sx={{ p: 2, height: 380, overflow: 'auto' }}>
    <Typography variant="h6" gutterBottom>
      Messages / Alerts (Future)
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Placeholder for backend-integrated messaging or announcements.
    </Typography>
  </Paper>
);

export default MessagesPanel;
