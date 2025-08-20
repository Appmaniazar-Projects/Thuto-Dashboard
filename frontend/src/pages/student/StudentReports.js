import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getMyReports } from '../../services/studentService';
import { format } from 'date-fns';

const StudentReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [filters, setFilters] = useState({
    reportType: 'all',
    year: 'all',
  });

  const reportTypes = [
    { id: 'all', name: 'All Reports' },
    { id: 'term1', name: 'Term 1 Report' },
    { id: 'term2', name: 'Term 2 Report' },
    { id: 'term3', name: 'Term 3 Report' },
    { id: 'final', name: 'Final Report' },
  ];

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const reportData = await getMyReports();
      setReports(reportData);
      setFilteredReports(reportData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Could not load your reports. Please try again later.');
      setNotification({
        open: true,
        message: 'Failed to load reports',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  const applyFilters = () => {
    let result = [...reports];
    
    if (filters.reportType !== 'all') {
      result = result.filter(report => report.type === filters.reportType);
    }
    
    if (filters.year !== 'all') {
      result = result.filter(report => 
        new Date(report.issueDate).getFullYear().toString() === filters.year
      );
    }
    
    setFilteredReports(result);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      // This would be implemented in your reportService
      const response = await downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setNotification({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Download failed:', error);
      setNotification({
        open: true,
        message: 'Failed to download report',
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Extract unique years from reports
  const availableYears = ['all', ...new Set(
    reports.map(report => new Date(report.issueDate).getFullYear())
  )].sort((a, b) => b - a);

  if (loading && reports.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Academic Reports
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchReports} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterIcon color="action" />
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Report Type</InputLabel>
            <Select
              name="reportType"
              value={filters.reportType}
              onChange={handleFilterChange}
              label="Report Type"
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Year</InputLabel>
            <Select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              label="Year"
            >
              <MenuItem value="all">All Years</MenuItem>
              {availableYears.map((year) => (
                year !== 'all' && (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                )
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {reports.length === 0 
              ? 'No reports available yet.' 
              : 'No reports match your filters.'}
          </Typography>
          {reports.length > 0 && filters.reportType !== 'all' && (
            <Button
              variant="text"
              color="primary"
              onClick={() => setFilters({ reportType: 'all', year: 'all' })}
              sx={{ mt: 1 }}
            >
              Clear filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReports.map((report) => (
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
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Issued:</strong> {format(new Date(report.issueDate), 'MMM d, yyyy')}
                    </Typography>
                    {report.teacher && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Teacher:</strong> {report.teacher}
                      </Typography>
                    )}
                    {report.comments && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mt: 1, fontStyle: 'italic' }}
                      >
                        {report.comments.length > 100 
                          ? `${report.comments.substring(0, 100)}...` 
                          : report.comments}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(report.id, report.fileName)}
                    disabled={!report.downloadUrl}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default StudentReports;
