// components/dashboard/admin/GenderBreakdown.js
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#FF69B4'];

const GenderBreakdown = ({ students = [] }) => {
  // Process students data to get gender breakdown
  const getGenderData = (studentsList) => {
    const genderCount = studentsList.reduce((acc, student) => {
      const gender = (student.gender || 'Unknown').toUpperCase();
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(genderCount).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(), // Capitalize first letter
      value
    }));
  };

  const genderData = getGenderData(students);

  if (!students.length) return (
    <Paper sx={{ p: 2, height: 380 }}>
      <Typography variant="h6" gutterBottom>
        Number of Learners by Gender
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
        No student data available
      </Typography>
    </Paper>
  );

  if (!genderData.length) return (
    <Paper sx={{ p: 2, height: 380 }}>
      <Typography variant="h6" gutterBottom>
        Number of Learners by Gender
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
        No gender data available
      </Typography>
    </Paper>
  );

  return (
    <Paper sx={{ p: 2, height: 380 }}>
      <Typography variant="h6" gutterBottom>
        Number of Learners by Gender
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default GenderBreakdown;