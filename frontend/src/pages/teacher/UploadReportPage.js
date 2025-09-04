import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getMyStudents } from '../../services/teacherService';
import { uploadTeacherStudentReport } from '../../services/reportService';

// Mock data for report types, can be fetched from a service later
const reportTypes = [
  { id: 'term1', name: 'First Term Report Card' },
  { id: 'term2', name: 'Second Term Progress Report' },
  { id: 'midyear', name: 'Midyear Assessment' },
  { id: 'final', name: 'Final Year-End Report' },
];

const UploadReportPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentData = await getMyStudents();
        setStudents(studentData);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        setNotification({ open: true, message: 'Could not load your student list.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setNotification({ open: true, message: 'Please select a valid PDF file.', severity: 'warning' });
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedStudent || !selectedReportType || !selectedFile) {
      setNotification({ open: true, message: 'Please fill all fields and select a file.', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await uploadTeacherStudentReport(selectedStudent, selectedFile, selectedReportType);
      setNotification({ open: true, message: `Successfully uploaded report for the selected student.`, severity: 'success' });

      // Reset form
      setSelectedStudent('');
      setSelectedReportType('');
      setSelectedFile(null);
      document.getElementById('file-upload-input').value = '';
    } catch (error) {
      console.error('Failed to upload report:', error);
      setNotification({ open: true, message: 'Failed to upload report. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          <CloudUploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Upload Student Report
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Select one of your students, choose the report type, and upload the official PDF document.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="student-select-label">Select Student</InputLabel>
              <Select
                labelId="student-select-label"
                value={selectedStudent}
                label="Select Student"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name} (ID: {student.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={selectedReportType}
                label="Report Type"
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ py: 1.5 }}
            >
              {selectedFile ? `File Selected: ${selectedFile.name}` : 'Choose Report PDF'}
              <input
                id="file-upload-input"
                type="file"
                hidden
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !selectedStudent || !selectedReportType || !selectedFile}
              onClick={handleUpload}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Uploading...' : 'Upload Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadReportPage;
