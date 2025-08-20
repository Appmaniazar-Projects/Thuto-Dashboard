import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Button, CircularProgress, Alert, Snackbar, Chip, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Download as DownloadIcon, Description as DescriptionIcon, Refresh as RefreshIcon, Person as PersonIcon } from '@mui/icons-material';
import { getMyChildren, getChildReports } from '../../services/parentService';
import { format } from 'date-fns';

const ParentReports = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({ reportType: 'all', year: 'all' });

  // Fetch children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getMyChildren();
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      } catch (err) {
        setError('Failed to load children data');
      }
    };
    fetchChildren();
  }, []);

  // Fetch reports when selected child changes
  useEffect(() => {
    if (selectedChild) {
      fetchChildReports(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildReports = async (childId) => {
    try {
      setLoading(true);
      const reportData = await getChildReports(childId);
      setReports(reportData);
    } catch (error) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      // Implement download logic here
      setNotification({
        open: true,
        message: 'Download started',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Download failed',
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const selectedChildData = children.find(child => child.id === selectedChild) || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Children's Reports
      </Typography>

      {/* Child Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Child</InputLabel>
          <Select
            value={selectedChild || ''}
            onChange={(e) => setSelectedChild(e.target.value)}
            label="Select Child"
            startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            {children.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                {child.name} - {child.grade || 'Grade N/A'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedChild && (
        <>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : reports.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <DescriptionIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No reports available for {selectedChildData.name}.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {report.title || 'Academic Report'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={report.type || 'Report'} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Issued:</strong> {format(new Date(report.issueDate), 'MMM d, yyyy')}
                      </Typography>
                      <Button 
                        size="small" 
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(report.id, report.fileName)}
                        sx={{ mt: 2 }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParentReports;
