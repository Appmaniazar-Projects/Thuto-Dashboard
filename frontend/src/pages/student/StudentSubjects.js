import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Avatar,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  Subject as SubjectIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const subjectColors = {
  'Mathematics': '#1976d2',
  'Science': '#388e3c',
  'English Literature': '#7b1fa2',
  'History': '#f57c00',
  'Computer Science': '#303f9f',
  'Art': '#e91e63'
};

const sampleSubjects = [
  { 
    id: 1, 
    name: 'Mathematics', 
    teacher: 'Mr. John Doe', 
    code: 'MATH101',
    description: 'Advanced algebra and geometry concepts',
    room: 'Room 101'
  },
  { 
    id: 2, 
    name: 'Science', 
    teacher: 'Ms. Jane Smith', 
    code: 'SCI202',
    description: 'Biology, Chemistry, and Physics fundamentals',
    room: 'Lab 1'
  },
  { 
    id: 3, 
    name: 'English Literature', 
    teacher: 'Mrs. Anne Brown', 
    code: 'ENG303',
    description: 'Classic and modern literature analysis',
    room: 'Room 203'
  },
  { 
    id: 4, 
    name: 'History', 
    teacher: 'Mr. Paul Green', 
    code: 'HIS404',
    description: 'World history from ancient to modern times',
    room: 'Room 105'
  },
  { 
    id: 5, 
    name: 'Computer Science', 
    teacher: 'Ms. Alice White', 
    code: 'CS505',
    description: 'Programming fundamentals and problem solving',
    room: 'Computer Lab'
  },
  { 
    id: 6, 
    name: 'Art', 
    teacher: 'Mr. David Wilson', 
    code: 'ART606',
    description: 'Creative expression through various mediums',
    room: 'Art Studio'
  }
];

const StudentSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubject(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Subjects
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View all the subjects you're enrolled in this academic year.
      </Typography>

      {/* Summary Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h3" fontWeight="bold">
              {sampleSubjects.length}
            </Typography>
            <Typography variant="h6">
              Enrolled Subjects
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Subject Cards */}
      <Grid container spacing={3}>
        {sampleSubjects.map((subject) => (
          <Grid item xs={12} sm={6} lg={4} key={subject.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleSubjectClick(subject)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: subjectColors[subject.name] || 'primary.main',
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <SubjectIcon fontSize="large" />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6" fontWeight="600">
                      {subject.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subject.code}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {subject.teacher}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <BookIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {subject.room}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  sx={{ mt: 2, width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubjectClick(subject);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Subject Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedSubject && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar 
                  sx={{ 
                    bgcolor: subjectColors[selectedSubject.name] || 'primary.main',
                    mr: 2,
                    width: 48,
                    height: 48
                  }}
                >
                  <SubjectIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedSubject.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSubject.code}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedSubject.description}
              </Typography>
              
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>Subject Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Teacher" 
                      secondary={selectedSubject.teacher}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Classroom" 
                      secondary={selectedSubject.room}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SubjectIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Subject Code" 
                      secondary={selectedSubject.code}
                    />
                  </ListItem>
                </List>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentSubjects;
