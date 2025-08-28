import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Alert, Button
} from '@mui/material';
import { Assessment as AssessmentIcon, Download as DownloadIcon } from '@mui/icons-material';
import parentService from '../../services/parentService';

const AcademicReportsPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const data = await parentService.getMyChildren();
        setChildren(data);
        if (data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch children.');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      const fetchReports = async () => {
        try {
          setLoading(true);
          setError('');
          const data = await parentService.getChildReports(selectedChildId);
          setReports(data);
        } catch (err) {
          setError('Failed to fetch academic reports.');
          setReports([]);
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    }
  }, [selectedChildId]);

  const handleChildChange = (event) => {
    setSelectedChildId(event.target.value);
  };

  const handleDownload = (reportUrl) => {
    window.open(reportUrl, '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Academic Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth disabled={loading || children.length === 0}>
          <InputLabel>Select Child</InputLabel>
          <Select value={selectedChildId} label="Select Child" onChange={handleChildChange}>
            {children.map(child => (
              <MenuItem key={child.id} value={child.id}>{child.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {reports.length > 0 ? (
            reports.map(report => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary">Date: {new Date(report.date).toLocaleDateString()}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(report.downloadUrl)}
                  >
                    Download
                  </Button>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography sx={{ ml: 3 }}>No reports available for the selected child.</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AcademicReportsPage;