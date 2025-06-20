import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Select, MenuItem, FormControl, InputLabel, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Snackbar } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Using the same dummy database as StudentReports for academic reports
const academicReportsData = [
  { 
    id: 1, 
    title: 'First Term Report Card', 
    term: 'Term 1', 
    year: '2024/2025',
    date: '2024-12-15',
    type: 'Report Card',
    subjects: [
      { name: 'Mathematics', grade: 'A', percentage: 92, comment: 'Excellent problem-solving skills' },
      { name: 'Science', grade: 'B+', percentage: 88, comment: 'Good understanding of concepts' },
      { name: 'English', grade: 'A', percentage: 95, comment: 'Outstanding written and verbal communication' },
      { name: 'History', grade: 'B', percentage: 85, comment: 'Good analytical skills, needs to improve on dates' },
      { name: 'Art', grade: 'A+', percentage: 98, comment: 'Exceptional creativity and technique' },
    ],
    teacherComment: 'Emma is a dedicated student who consistently demonstrates a strong work ethic.',
    attendanceRate: 97
  },
  { 
    id: 2, 
    title: 'Second Term Progress Report', 
    term: 'Term 2', 
    year: '2024/2025',
    date: '2025-03-20',
    type: 'Progress Report',
    subjects: [
      { name: 'Mathematics', grade: 'A-', percentage: 90, comment: 'Continues to excel in algebraic concepts' },
      { name: 'Science', grade: 'A', percentage: 93, comment: 'Significant improvement in lab work' },
      { name: 'English', grade: 'A', percentage: 94, comment: 'Maintains high standards in written assignments' },
      { name: 'History', grade: 'B+', percentage: 87, comment: 'Shows increased engagement with historical analysis' },
      { name: 'Art', grade: 'A+', percentage: 98, comment: 'Continues to demonstrate exceptional artistic ability' },
    ],
    teacherComment: 'Emma continues to be a top performer in class and shows excellent leadership qualities.',
    attendanceRate: 98
  },
  { 
    id: 3, 
    title: 'Midyear Assessment', 
    term: 'Midyear', 
    year: '2024/2025',
    date: '2025-01-20',
    type: 'Assessment',
    subjects: [
      { name: 'Mathematics', grade: 'A-', percentage: 91, comment: 'Strong performance in midyear assessment' },
      { name: 'Science', grade: 'B+', percentage: 89, comment: 'Good grasp of scientific principles' },
      { name: 'English', grade: 'A', percentage: 94, comment: 'Excellent comprehension and analysis' },
      { name: 'History', grade: 'B', percentage: 86, comment: 'Solid understanding of historical contexts' },
      { name: 'Art', grade: 'A', percentage: 96, comment: 'Creative and technically proficient' },
    ],
    teacherComment: 'Emma has shown consistent performance across all subjects and demonstrates strong critical thinking skills.',
    attendanceRate: 95
  }
];

const ParentReports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const generatePDF = (report) => {
    try {
      // Initialize jsPDF
      const doc = new jsPDF();
      const reportData = academicReportsData.find(r => r.id === report);
      
      if (!reportData) {
        setNotification({
          open: true,
          message: 'Report not found',
          severity: 'error'
        });
        return;
      }
      
      // Add school header
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text('CyberSkolo Academy', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(reportData.title, 105, 30, { align: 'center' });
      
      // Student information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Student: Emma Thompson`, 20, 45);
      doc.text(`Grade: 8`, 20, 52);
      doc.text(`Term: ${reportData.term}`, 20, 59);
      doc.text(`Academic Year: ${reportData.year}`, 20, 66);
      doc.text(`Date: ${reportData.date}`, 20, 73);
      doc.text(`Attendance Rate: ${reportData.attendanceRate}%`, 20, 80);
      
      // Create table for subjects
      const tableColumn = ["Subject", "Grade", "Percentage", "Comment"];
      const tableRows = [];
      
      reportData.subjects.forEach(subject => {
        const subjectData = [
          subject.name,
          subject.grade,
          `${subject.percentage}%`,
          subject.comment
        ];
        tableRows.push(subjectData);
      });
      
      // Generate the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
      
      // Add teacher comment
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Teacher\'s Comment:', 20, finalY + 15);
      doc.setFont(undefined, 'normal');
      doc.text(reportData.teacherComment, 20, finalY + 22);
      
      // Add signature section
      doc.text('______________________', 40, finalY + 50);
      doc.text('Teacher Signature', 45, finalY + 57);
      
      doc.text('______________________', 150, finalY + 50);
      doc.text('Principal Signature', 155, finalY + 57);
      
      // Add parent acknowledgment section
      doc.text('______________________', 95, finalY + 75);
      doc.text('Parent Signature', 100, finalY + 82);
      
      // Save the PDF
      doc.save(`${reportData.title.replace(/ /g, '_')}.pdf`);
      
      setNotification({
        open: true,
        message: 'Report successfully generated and downloaded',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({
        open: true,
        message: 'Failed to generate PDF. Please try again later.',
        severity: 'error'
      });
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <ArticleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your Child's Academic Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View and download your child's academic reports and progress summaries
        </Typography>
        
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
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="report-select-label">Select Report</InputLabel>
              <Select
                labelId="report-select-label"
                id="report-select"
                value={selectedReport}
                label="Select Report"
                onChange={handleReportChange}
              >
                {academicReportsData.map((report) => (
                  <MenuItem key={report.id} value={report.id}>
                    {report.title} ({report.term} - {report.year})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              disabled={!selectedReport}
              onClick={() => generatePDF(selectedReport)}
              sx={{ height: '100%' }}
            >
              Download Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {selectedReport && (
        <Paper sx={{ p: 3 }}>
          {(() => {
            const report = academicReportsData.find(r => r.id === selectedReport);
            return (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>{report.title}</Typography>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" color="text.secondary">Child: Emma Thompson</Typography>
                    <Typography variant="body2" color="text.secondary">Grade: 8</Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Term:</Typography>
                    <Typography variant="body1">{report.term}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Academic Year:</Typography>
                    <Typography variant="body1">{report.year}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Issue Date:</Typography>
                    <Typography variant="body1">{report.date}</Typography>
                  </Grid>
                </Grid>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Subject</TableCell>
                        <TableCell sx={{ color: 'white' }}>Grade</TableCell>
                        <TableCell sx={{ color: 'white' }}>Percentage</TableCell>
                        <TableCell sx={{ color: 'white' }}>Teacher's Comment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.subjects.map((subject, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.grade}</TableCell>
                          <TableCell>{subject.percentage}%</TableCell>
                          <TableCell>{subject.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Attendance Summary</Typography>
                      <Typography variant="h6" color={report.attendanceRate >= 95 ? 'success.main' : report.attendanceRate >= 90 ? 'warning.main' : 'error.main'}>
                        {report.attendanceRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.attendanceRate >= 95 
                          ? 'Excellent attendance record!'
                          : report.attendanceRate >= 90
                            ? 'Good attendance, but there is room for improvement.'
                            : 'Attendance needs improvement.'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Overall Performance</Typography>
                      <Typography variant="body2" paragraph>
                        Average: {Math.round(report.subjects.reduce((sum, subject) => sum + subject.percentage, 0) / report.subjects.length)}%
                      </Typography>
                      <Typography variant="body2">
                        {report.teacherComment}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => generatePDF(selectedReport)}
                  >
                    Download PDF
                  </Button>
                </Box>
              </>
            );
          })()}
        </Paper>
      )}
    </Box>
  );
};

export default ParentReports;
