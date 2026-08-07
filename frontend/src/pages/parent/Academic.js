import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, 
  MenuItem, Grid, CircularProgress, Alert, Button
} from '@mui/material';
import { Assessment as AssessmentIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useParent } from '../../context/ParentContext';
import { useAuth } from '../../context/AuthContext';
import parentService from '../../services/parentService';
import { formatDisplayDate } from '../../utils/date';

// NOTE: Backend (ParentController.getChildReports) currently returns
// List<String> - raw file paths - not objects with title/date/description.
// This normalizes each raw path into a display-friendly shape so the UI
// below doesn't break. Once the backend returns a proper StudentFileDTO
// (id, title, date, description, downloadUrl), this can be simplified to
// just use the response directly.
const normalizeReports = (rawList) => {
  const list = Array.isArray(rawList) ? rawList : [];
  return list
    .map((item, index) => {
      // Backend may return either raw strings (current behavior) or
      // objects (if this is ever upgraded) - handle both.
      if (typeof item === 'string') {
        const path = item;
        const fileName = path.split('/').pop() || `Report ${index + 1}`;
        return {
          id: path,
          title: fileName,
          date: null,
          description: '',
          downloadUrl: path,
        };
      }
      if (item && typeof item === 'object') {
        return {
          id: item.id ?? item.downloadUrl ?? index,
          title: item.title ?? item.fileName ?? item.name ?? `Report ${index + 1}`,
          date: item.date ?? null,
          description: item.description ?? '',
          downloadUrl: item.downloadUrl ?? item.filePath ?? item.url ?? null,
        };
      }
      return null;
    })
    .filter(Boolean);
};

const AcademicReportsPage = () => {
  const { children, loading: childrenLoading, error: childrenError } = useParent();
  const { user } = useAuth();
  const location = useLocation();
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState('');

  const queryStudentId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('studentId');
    return id ? id.toString() : '';
  }, [location.search]);

  const coerceId = (id) => {
    if (id === null || id === undefined || id === '') return '';
    const num = Number(id);
    return Number.isNaN(num) ? id : num;
  };

  useEffect(() => {
    if (children.length === 0) return;

    const queryId = coerceId(queryStudentId);
    const queryExists = queryId ? children.some(c => String(c.id) === String(queryId)) : false;
    const nextId = queryExists ? queryId : (children[0]?.id || '');

    if (nextId && String(nextId) !== String(selectedChildId)) {
      setSelectedChildId(nextId);
    }
  }, [children, queryStudentId, selectedChildId]);

  useEffect(() => {
    if (selectedChildId) {
      const fetchReports = async () => {
        try {
          setIsLoadingReports(true);
          setReportsError('');

          // getChildAcademicReports now reads the parent's id from localStorage
          // internally (see parentService.js) - it no longer takes a phone
          // number. The backend's ownership check compares against the
          // parent's numeric user id, not their phone number.
          const data = await parentService.getChildAcademicReports(selectedChildId);
          setReports(normalizeReports(data));
        } catch (err) {
          console.error('Error fetching reports:', err);
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
                    {report.date && (
                      <Typography variant="body2" color="text.secondary">
                        Date: {formatDisplayDate(report.date)}
                      </Typography>
                    )}
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
                    disabled={!report.downloadUrl}
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