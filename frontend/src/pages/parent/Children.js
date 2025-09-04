import React, { useEffect, useState } from 'react';
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
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Face as ChildIcon, Add as AddIcon, Event as EventIcon, Assessment as GradesIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../../context/ParentContext';

const Children = () => {
  const navigate = useNavigate();
  const { children, loading, error } = useParent();
    
  useEffect(() => {
    const fetchChildren = async () => {
      try {
      } catch (err) {
        console.error('Failed to fetch children:', err);
      }
    };

    fetchChildren();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (children.length === 0) {
    return <Alert severity="info" sx={{ m: 3 }}>No children are linked to your profile yet.</Alert>;
  }

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
        {children.map((child) => (
          <Grid item xs={12} sm={6} md={4} key={child.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.light' }}
                    src={child.avatar || ''}
                  >
                    {!child.avatar && <ChildIcon fontSize="large" />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{child.name}</Typography>
                    <Typography color="text.secondary">{child.school}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Chip label={`${child.grade} - ${child.class}`} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Quick links to view {child.name.split(' ')[0]}'s grades and attendance.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-start', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<GradesIcon />}
                  onClick={() => navigate(`/parent/grades/${child.id}`)}
                >
                  View Grades
                </Button>
                <Button
                  size="small"
                  startIcon={<EventIcon />}
                  onClick={() => navigate(`/parent/attendance/${child.id}`)}
                >
                  View Attendance
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Children;
