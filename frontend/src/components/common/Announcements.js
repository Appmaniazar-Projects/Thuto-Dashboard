import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useTheme } from '@mui/material/styles';

const Announcements = ({ announcements = [], maxItems = 3 }) => {
  const theme = useTheme();
  
  // If no announcements are provided, show a default message
  const displayAnnouncements = announcements.length > 0 
    ? announcements.slice(0, maxItems)
    : [{ id: 1, text: 'No announcements at this time.' }];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CampaignIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3">
          Announcements
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {displayAnnouncements.map((announcement, index) => (
          <React.Fragment key={announcement.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.primary">
                    {announcement.text}
                  </Typography>
                }
                secondary={
                  announcement.date && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(announcement.date).toLocaleDateString()}
                    </Typography>
                  )
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      
      {announcements.length > maxItems && (
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ 
            mt: 1, 
            alignSelf: 'flex-end',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          View all announcements
        </Typography>
      )}
    </Paper>
  );
};

export default Announcements;
