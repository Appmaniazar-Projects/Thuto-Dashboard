import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getChildAcademicReports } from '../../services/parentService'; // We will add this function

// Mock function to generate PDF, replace with actual implementation later
const generatePDF = (report) => {
  alert(`Downloading ${report.title}... (Not implemented yet)`);
  console.log('Generating PDF for:', report);
};

const AcademicReportsView = ({ childId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!childId) {
      setReports([]);
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError('');
        // This service function needs to be created
        const data = await getChildAcademicReports(childId);
        setReports(data);
      } catch (err) {
        setError('Failed to fetch academic reports.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [childId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  if (reports.length === 0) {
    return <Typography sx={{ my: 2 }}>No academic reports found for this child.</Typography>;
  }

  return (
    <List>
      {reports.map((report) => (
        <ListItem 
          key={report.id} 
          secondaryAction={
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={() => generatePDF(report)}
            >
              Download
            </Button>
          }
        >
          <ListItemText 
            primary={report.title}
            secondary={`${report.term} - ${report.year}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AcademicReportsView;
