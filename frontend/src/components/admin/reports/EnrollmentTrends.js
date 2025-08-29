import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateReport } from '../../../services/reportService';

const EnrollmentTrends = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  const availableYears = [2021, 2022, 2023, 2024, 2025];

  useEffect(() => {
    fetchEnrollmentData();
  }, [selectedYear]);

  const fetchEnrollmentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateReport('enrollment', { year: selectedYear });
      
      if (response && response.data) {
        setEnrollmentData(response.data);
        const total = response.data.reduce((sum, item) => sum + item.students, 0);
        setTotalStudents(total);
      } else {
        setError('Enrollment data will be available soon. Backend integration in progress.');
        setEnrollmentData([]);
        setTotalStudents(0);
      }
    } catch (err) {
      console.error('Failed to fetch enrollment data:', err);
      setError('Enrollment reports are coming soon. Backend integration in progress.');
      setEnrollmentData([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enrollment Trends Report
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={handleYearChange}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="h6" sx={{ ml: 2 }}>
          Total Students: {totalStudents}
        </Typography>
      </Box>

      {error ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Student Enrollment by Grade - {selectedYear}
            </Typography>
            
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#1976d2" name="Number of Students" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No enrollment data available for {selectedYear}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EnrollmentTrends;
