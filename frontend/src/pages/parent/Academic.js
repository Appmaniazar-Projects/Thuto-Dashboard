import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, 
  MenuItem, Grid, CircularProgress, Alert, Button
} from '@mui/material';
import { Assessment as AssessmentIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useParent } from '../../context/ParentContext';
import parentService from '../../services/parentService';

const AcademicReportsPage = () => {
  const { children, loading: childrenLoading, error: childrenError } = useParent();
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState('');

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0]?.id || '');
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    if (selectedChildId) {
      const fetchReports = async () => {
        try {
          setIsLoadingReports(true);
          setReportsError('');
          const data = await parentService.getChildReports(selectedChildId);
          setReports(data || []);
        } catch (err) {
          console.error('Error fetching reports:', err);
          setReportsError('Failed to fetch academic reports. Please try again.');
          setReports([]);
        } finally {
          setIsLoadingReports(false);
        }
      };
      fetchReports();
    }
  }, [selectedChildId]);

  const handleChildChange = (event) => {
    setSelectedChildId(event.target.value);
  };

  const handleDownload = (reportUrl) => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  if (childrenLoading) {
    return <CircularProgress />;
  }

  if (childrenError) {
    return <Alert severity="error">{childrenError}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Academic Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth disabled={children.length === 0} sx={{ minWidth: 200 }}>
          <InputLabel>Select Child</InputLabel>
          <Select 
            value={selectedChildId} 
            label="Select Child" 
            onChange={handleChildChange}
          >
            {children.map(child => (
              <MenuItem key={child.id} value={child.id}>
                {child.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {isLoadingReports && <CircularProgress />}
      {reportsError && <Alert severity="error" sx={{ mb: 2 }}>{reportsError}</Alert>}

      {!isLoadingReports && !reportsError && (
        <Grid container spacing={3}>
          {reports.length > 0 ? (
            reports.map(report => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Paper sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  height: '100%',
                  '&:hover': {
                    boxShadow: 2,
                  }
                }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(report.date).toLocaleDateString()}
                    </Typography>
                    {report.description && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {report.description}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(report.downloadUrl)}
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    Download
                  </Button>
                </Paper>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {selectedChildId 
                  ? "No reports available for the selected child." 
                  : "Please select a child to view reports."}
              </Typography>
            </Box>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AcademicReportsPage;