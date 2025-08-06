import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Button, List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import { School as SchoolIcon, CloudDownload as DownloadIcon, Person as PersonIcon } from '@mui/icons-material';

// Mock data
const childrenData = [
  { id: 1, name: 'Emma Thompson', grade: 'Grade 8' },
  { id: 2, name: 'James Thompson', grade: 'Grade 5' }
];

const academicReportsData = {
  1: [ // Emma's reports
    { id: 'rep1', title: 'Term 1 Report Card, 2025', date: '2025-04-15', url: '/path/to/report1.pdf' },
    { id: 'rep2', title: 'Mid-Year Exam Results, 2025', date: '2025-06-20', url: '/path/to/report2.pdf' },
  ],
  2: [ // James's reports
    { id: 'rep3', title: 'Term 1 Report Card, 2025', date: '2025-04-15', url: '/path/to/report3.pdf' },
  ]
};

const ParentAcademicPage = () => {
  const [selectedChild, setSelectedChild] = useState(childrenData[0].id);

  const handleChildChange = (event) => {
    setSelectedChild(event.target.value);
  };

  const handleDownload = (url) => {
    // In a real app, this would trigger a file download
    alert(`Downloading report from: ${url}`);
  };

  const currentReports = academicReportsData[selectedChild] || [];
  const selectedChildInfo = childrenData.find(child => child.id === selectedChild);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Academic Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Download official academic reports for your children.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="child-select-label">Select Child</InputLabel>
              <Select
                labelId="child-select-label"
                value={selectedChild}
                label="Select Child"
                onChange={handleChildChange}
              >
                {childrenData.map(child => (
                  <MenuItem key={child.id} value={child.id}>{child.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {selectedChildInfo && (
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="500">
                  {selectedChildInfo.name} - {selectedChildInfo.grade}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Reports
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {currentReports.length > 0 ? (
            <List>
              {currentReports.map((report, index) => (
                <ListItem 
                  key={report.id} 
                  divider={index < currentReports.length - 1}
                  secondaryAction={
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />} 
                      onClick={() => handleDownload(report.url)}
                    >
                      Download
                    </Button>
                  }
                >
                  <ListItemText 
                    primary={report.title} 
                    secondary={`Issued on: ${new Date(report.date).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 3 }}>
              No academic reports available for the selected child.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ParentAcademicPage;

