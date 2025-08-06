import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { Face as ChildIcon, Add as AddIcon, Event as EventIcon, Assessment as GradesIcon } from '@mui/icons-material';

// Mock data for parent's children
const childrenData = [
  {
    id: 1,
    name: 'Emma Thompson',
    grade: 'Grade 8',
    class: 'Room 103',
    avatar: '/path/to/avatar1.jpg', // Placeholder
    school: 'Northwood High School'
  },
  {
    id: 2,
    name: 'James Thompson',
    grade: 'Grade 5',
    class: 'Room 201',
    avatar: '/path/to/avatar2.jpg', // Placeholder
    school: 'Westwood Elementary'
  }
];

const Children = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          My Children
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => alert('Navigate to add child page')}
        >
          Link New Child
        </Button>
      </Box>

      <Grid container spacing={3}>
        {childrenData.map((child) => (
          <Grid item xs={12} sm={6} md={4} key={child.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.light' }}>
                    <ChildIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {child.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {child.school}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Chip label={`${child.grade} - ${child.class}`} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Here you can find quick links to view {child.name.split(' ')[0]}'s academic progress and schedule.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-start', px: 2, pb: 2 }}>
                <Button size="small" startIcon={<GradesIcon />}>View Grades</Button>
                <Button size="small" startIcon={<EventIcon />}>View Timetable</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Children;

