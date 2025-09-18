import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { Link } from 'react-router-dom';
import gradeService from '../../services/gradeService';

// Sample data - would come from API in production
const reportTypes = [
  { id: 'attendance', name: 'Attendance Report', icon: <PeopleIcon /> },
  { id: 'enrollment', name: 'Enrollment Report', icon: <SchoolIcon /> },
  { id: 'performance', name: 'Performance Analytics', icon: <InsertChartIcon /> }
];

const PDFReportGenerator = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportSettings, setReportSettings] = useState({
    grade: '',
    reportType: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const gradesData = await gradeService.getSchoolGrades();
      setGrades(gradesData);
    } catch (error) {
      console.error('Failed to load grades:', error);
      setNotification({
        open: true,
        message: 'Failed to load grades',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportSettings({ ...reportSettings, [name]: value });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const generatePDF = () => {
    try {
      const { grade, reportType } = reportSettings;
      
      // Validate inputs
      if (!reportType) {
        setNotification({
          open: true,
          message: 'Please select a report type',
          severity: 'error'
        });
        return;
      }
      
      // Just show a success notification since we can't generate actual PDFs yet
      setNotification({
        open: true,
        message: 'PDF generation feature will be implemented once dependencies are installed',
        severity: 'info'
      });
      
      // When jspdf is available, actual PDF generation code will be used
    } catch (error) {
      console.error('Error with report generation:', error);
      setNotification({
        open: true,
        message: 'Error preparing report. Please try again.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading grades...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <PictureAsPdfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Administrative Reports
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                name="reportType"
                value={reportSettings.reportType}
                label="Report Type"
                onChange={handleChange}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {type.icon && <Box sx={{ mr: 1 }}>{type.icon}</Box>}
                      {type.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="grade-label">Grade (Optional)</InputLabel>
              <Select
                labelId="grade-label"
                id="grade"
                name="grade"
                value={reportSettings.grade}
                label="Grade (Optional)"
                onChange={handleChange}
              >
                <MenuItem value=""><em>All Grades</em></MenuItem>
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<FileDownloadIcon />}
                onClick={generatePDF}
                fullWidth
                sx={{ height: '56px' }}
              >
                Generate Report
              </Button>
            </Box>
          </Grid>
        </Grid>
        
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
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Academic Reports Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Quick access to student and parent academic report portals
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIndIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Student Reports</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Access the student portal where learners can view and download their academic reports.
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/student-reports"
                  sx={{ mt: 1 }}
                >
                  Student Portal
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FamilyRestroomIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Parent Reports</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Access the parent portal where guardians can view and download their children's academic reports.
                </Typography>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/parent-reports"
                  sx={{ mt: 1 }}
                >
                  Parent Portal
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PDFReportGenerator;
