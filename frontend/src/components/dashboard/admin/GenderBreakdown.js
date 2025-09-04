// components/dashboard/admin/GenderBreakdown.js
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGenderData } from '../../../hooks/useStudentsData';

const COLORS = ['#0088FE', '#FF69B4'];

const GenderBreakdown = () => {
  const { genderData, loading, error } = useGenderData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!genderData.length) return <div>No data available</div>;

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