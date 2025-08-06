import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Button, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';

// Available reports for download (grades not yet in database)
const availableReports = [
  { 
    id: 1, 
    title: 'First Term Report Card', 
    term: 'Term 1', 
    year: '2024/2025',
    date: '2024-12-15',
    status: 'Available',
    description: 'Complete academic performance report for first term'
  },
  { 
    id: 2, 
    title: 'Second Term Progress Report', 
    term: 'Term 2', 
    year: '2024/2025',
    date: '2025-03-20',
    status: 'Available',
    description: 'Progress assessment and feedback for second term'
  },
  { 
    id: 3, 
    title: 'Midyear Assessment', 
    term: 'Midyear', 
    year: '2024/2025',
    date: '2025-01-20',
    status: 'Available',
    description: 'Comprehensive midyear academic evaluation'
  }
];

const StudentReports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const downloadReport = () => {
    if (!selectedReport) {
      setNotification({
        open: true,
        message: 'Please select a report first',
        severity: 'warning'
      });
      return;
    }
    
    const report = availableReports.find(r => r.id === selectedReport);
    if (!report) {
      setNotification({
        open: true,
        message: 'Report not found',
        severity: 'error'
      });
      return;
    }
    
    // Simulate download (in real app, this would call backend API)
    setNotification({
      open: true,
      message: `Downloading ${report.title}...`,
      severity: 'success'
    });
    
    // TODO: Replace with actual API call to backend
    // Example: await downloadStudentReport(selectedReport);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <ArticleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Academic Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Download your academic reports. Detailed grades will be available once they are entered into the system.
        </Typography>
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={4000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel id="report-select-label">Select Report</InputLabel>
              <Select
                labelId="report-select-label"
                id="report-select"
                value={selectedReport}
                label="Select Report"
                onChange={handleReportChange}
              >
                {availableReports.map((report) => (
                  <MenuItem key={report.id} value={report.id}>
                    {report.title} ({report.term} - {report.year})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              disabled={!selectedReport}
              onClick={downloadReport}
              fullWidth
              sx={{ height: '56px' }}
            >
              Download Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentReports;
