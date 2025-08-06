// components/dashboard/admin/GenderBreakdown.js
import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchStudents } from '../../../services/api';

const COLORS = ['#0088FE', '#FF69B4'];

const GenderBreakdown = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchStudents().then((res) => {
      const students = res.data || [];
      const male = students.filter(s => s.gender === 'male').length;
      const female = students.filter(s => s.gender === 'female').length;
      setData([
        { name: 'Male', value: male },
        { name: 'Female', value: female }
      ]);
    });
  }, []);

  return (
    <Paper sx={{ p: 2, height: 380 }}>
      <Typography variant="h6" gutterBottom>
        Number of Learners by Gender
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} learners`} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default GenderBreakdown;