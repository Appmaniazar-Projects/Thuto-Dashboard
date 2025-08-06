import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import { fetchStudentsForTeacher, submitAttendance } from '../../services/api';
import { Box, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const AttendanceRegisterPage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (grade && subject) {
      fetchStudentsForTeacher({ grade, subject }).then(res => setStudents(res.data));
    }
  }, [grade, subject]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleMark = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAttendance({ grade, subject, date, attendance });
  };

  return (
    <Box>
      <h1>Teacher Attendance Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select value={grade} onChange={e => setGrade(e.target.value)} displayEmpty>
            <MenuItem value="">Select Grade</MenuItem>
            {user?.grades?.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>) || []}
          </Select>
          <Select value={subject} onChange={e => setSubject(e.target.value)} displayEmpty>
            <MenuItem value="">Select Subject</MenuItem>
            {user?.subjects?.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>) || []}
          </Select>
          <Button variant="contained" type="submit">Submit Attendance</Button>
        </Box>
      </form>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Present</TableCell>
            <TableCell>Absent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>
                <input type="radio" checked={attendance[student.id] === 'present'} onChange={() => handleMark(student.id, 'present')} />
              </TableCell>
              <TableCell>
                <input type="radio" checked={attendance[student.id] === 'absent'} onChange={() => handleMark(student.id, 'absent')} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AttendanceRegisterPage; 