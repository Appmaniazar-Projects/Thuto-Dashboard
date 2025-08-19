import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { getMyChildren } from '../../services/parentService';
import PageTitle from '../../components/common/PageTitle';
import AttendanceView from '../../components/parent/AttendanceView';
import AcademicReportsView from '../../components/parent/AcademicReportsView';

const ParentReports = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const data = await getMyChildren();
        setChildren(data);
        if (data.length > 0) {
          setSelectedChild(data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch your children. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleChildChange = (event) => {
    setSelectedChild(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <PageTitle title="Child Reports" subtitle="View attendance and academic reports for your children" />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <CircularProgress />
        ) : children.length > 0 ? (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="child-select-label">Select Child</InputLabel>
            <Select
              labelId="child-select-label"
              value={selectedChild}
              label="Select Child"
              onChange={handleChildChange}
            >
              {children.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography>No children found for your account.</Typography>
        )}

        {selectedChild && (
          <Box>
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
              <Tab label="Attendance" />
              <Tab label="Academic Reports" />
            </Tabs>
            {tabValue === 0 && <AttendanceView childId={selectedChild} />}
            {tabValue === 1 && <AcademicReportsView childId={selectedChild} />}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ParentReports;
