import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Grid, Button, FormControl, InputLabel, 
  Select, MenuItem, TextField, Snackbar, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  CircularProgress, TablePagination
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';
import { getMyStudents } from '../../services/teacherService';
import { 
  uploadTeacherStudentReport, 
  getTeacherStudentReports,
  downloadReport,
  deleteReport
} from '../../services/reportService';
//import { format } from 'date-fns';


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
  const [reports, setReports] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const rawStudents = await getMyStudents();
      let baseStudents = [];

      if (Array.isArray(rawStudents)) {
        baseStudents = rawStudents;
      } else if (rawStudents && typeof rawStudents === 'object') {
        const arrayValue = Object.values(rawStudents).find((val) => Array.isArray(val));
        if (Array.isArray(arrayValue)) {
          baseStudents = arrayValue;
        }
      }

      const normalizedStudents = baseStudents
        .map((student) => {
          const id =
            student.id ??
            student.studentId ??
            student.userId ??
            student.uuid ??
            null;

          const name =
            student.name ||
            [student.firstName, student.lastName].filter(Boolean).join(' ') ||
            student.fullName ||
            student.displayName ||
            'Unknown Student';

          if (!id) {
            return null;
          }

          return {
            ...student,
            id,
            name,
          };
        })
        .filter(Boolean);

      setStudents(normalizedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setNotification({ open: true, message: 'Could not load your student list.', severity: 'error' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  //Comment added to load latest 
  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsData = [];
      // Fetch reports for each student
      for (const student of students) {
        try {
          const studentReports = await getTeacherStudentReports(student.id);
          reportsData.push(...studentReports.map(report => ({
            ...report,
            studentName: student.name,
            studentId: student.id
          })));
        } catch (err) {
          console.error(`Error fetching reports for student ${student.id}:`, err);
        }
      }
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setNotification({ open: true, message: 'Could not load reports.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchReports();
    }
  }, [students]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setNotification({ open: true, message: 'Please select a valid PDF file.', severity: 'warning' });
      setSelectedFile(null);
    }
  };



const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

const handleDownload = async (reportId, fileName, reportData) => {
  try {
    await downloadReport(reportId, fileName, reportData);
  } catch (error) {
    console.error('Download failed:', error);
    setNotification({ 
      open: true, 
      message: 'Failed to download report.', 
      severity: 'error' 
    });
  }
};

const handleDeleteReport = async (reportId, reportData) => {
  if (window.confirm('Are you sure you want to delete this report?')) {
    try {
      await deleteReport(reportId, reportData);
      setNotification({ 
        open: true, 
        message: 'Report deleted successfully.', 
        severity: 'success' 
      });
      // Refresh the reports list to reflect the deletion
      await fetchReports();
    } catch (error) {
      console.error('Delete failed:', error);
      setNotification({ 
        open: true, 
        message: 'Failed to delete report.', 
        severity: 'error' 
      });
    }
  }
};

const formatUploadDate = (uploadDate) => {
  if (!uploadDate) return '-';

  let value = uploadDate;

  // Handle "2025-11-20 10:16:0" -> "2025-11-20T10:16:0"
  if (typeof value === 'string' && value.includes(' ') && !value.includes('T')) {
    value = value.replace(' ', 'T');
  }

  // Handle "2025-11-19T10:48:07.545595" -> "2025-11-19T10:48:07.545"
  if (typeof value === 'string') {
    value = value.replace(/(\.\d{3})\d+/, '$1');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  
  return date.toLocaleDateString();           
};

const handleUpload = async () => {
  if (!selectedStudent || !selectedReportType || !selectedFile) {
    setNotification({ 
      open: true, 
      message: 'Please fill all fields and select a file.', 
      severity: 'warning' 
    });
    return;
  }

  try {
    setLoading(true);
    
    // Show upload progress
    setNotification({ 
      open: true, 
      message: 'Uploading report...', 
      severity: 'info',
      autoHideDuration: null // Don't auto-hide while uploading
    });

    // Upload the report
    const studentObj = students.find((s) => String(s.id) === String(selectedStudent));
    const result = await uploadTeacherStudentReport(
      selectedStudent, 
      selectedFile, 
      selectedReportType,
      {
        studentName: studentObj?.name
      }
    );

    // Show success message
    setNotification({ 
      open: true, 
      message: `Successfully uploaded ${result.fileName} for the selected student.`, 
      severity: 'success' 
    });

    // Refresh reports so the new upload is visible in the table
    await fetchReports();

    // Reset form
    setSelectedStudent('');
    setSelectedReportType('');
    setSelectedFile(null);
    document.getElementById('file-upload-input').value = '';
  } catch (error) {
    console.error('Failed to upload report:', error);
    setNotification({ 
      open: true, 
      message: error.message || 'Failed to upload report. Please try again.', 
      severity: 'error' 
    });
  } finally {
    setLoading(false);
  }
};


  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              <CloudUploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upload Student Report
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select one of your students, choose the report type, and upload the official PDF document.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchReports}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

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
<Paper sx={{ p: 3, mt: 3 }}>
  <Typography variant="h6" gutterBottom>Uploaded Reports</Typography>
  {loading ? (
    <Box display="flex" justifyContent="center" p={3}>
      <CircularProgress />
    </Box>
  ) : reports.length === 0 ? (
    <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 3 }}>
      No reports have been uploaded yet.
    </Typography>
  ) : (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Uploaded Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  {students.find(s => s.id === report.studentId)?.name || 'Unknown Student'}
                </TableCell>
                <TableCell>{report.reportType}</TableCell>
                <TableCell>
                  <a 
                    href={report.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    {report.fileName}
                  </a>
                </TableCell>
                <TableCell>
                  {formatUploadDate(report.uploadDate || report.uploadedAt)}
                </TableCell>
                <TableCell align="right">
                 <IconButton 
                  size="small" 
                  onClick={() => handleDownload(report.id, report.fileName, report)}
                  title="Download"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteReport(report.id, report)}
                  title="Delete"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={reports.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )}
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
