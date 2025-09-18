import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import gradeService from '../../../services/gradeService';

const EventMessageSidebar = ({ open, onClose, subjects, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadGrades();
    }
  }, [open]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const gradesData = await gradeService.getSchoolGrades();
      setGrades(gradesData);
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ description, date, subject, grade });
    setDescription('');
    setDate('');
    setSubject('');
    setGrade('');
    onClose();
  };

  if (!open) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 3, pt: 4, position: 'relative' }} component="form" onSubmit={handleSubmit}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, mt: 1 }}>
          Create Event / Announcement
        </Typography>
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          required
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Subject</InputLabel>
          <Select
            value={subject}
            label="Subject"
            onChange={e => setSubject(e.target.value)}
            required
          >
            {subjects.map((subj) => (
              <MenuItem key={subj} value={subj}>{subj}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Grade</InputLabel>
          <Select
            value={grade}
            label="Grade"
            onChange={e => setGrade(e.target.value)}
            required
            disabled={loading}
          >
            {grades.map((g) => (
              <MenuItem key={g.id} value={g.name}>{g.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Create
        </Button>
      </Box>
    </Drawer>
  );
};

export default EventMessageSidebar;