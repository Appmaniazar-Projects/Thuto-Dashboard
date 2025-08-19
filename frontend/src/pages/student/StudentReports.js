import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';
import { getMyReports } from '../../services/studentService';

const StudentReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const reportData = await getMyReports();
        setReports(reportData);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setNotification({ open: true, message: 'Could not load your reports.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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
    
    const report = reports.find(r => r.downloadUrl === selectedReport);
    if (!report) {
      setNotification({
        open: true,
        message: 'Report not found',
        severity: 'error'
      });
      return;
    }
    
    // Open the download URL in a new tab
    window.open(report.downloadUrl, '_blank');
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
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : (
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
                  {reports.map((report) => (
                    <MenuItem key={report.id} value={report.downloadUrl}>
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
        )}
      </Paper>
    </Box>
  );
};

export default StudentReports;
