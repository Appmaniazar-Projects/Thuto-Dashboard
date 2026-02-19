import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getMyStudents } from '../../services/teacherService';
import NotesToSelfPanel from '../../components/teacher/NotesToSelfPanel';

const TeacherNotesPage = () => {
  const { user } = useAuth();
  const teacherId = user?.id || '';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyStudents();
        setStudents(Array.isArray(data) ? data : []);
      } catch (e) {
        setStudents([]);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) => {
      const name = `${s?.name || ''} ${s?.lastName || ''}`.trim().toLowerCase();
      const phone = (s?.phoneNumber || '').toString().toLowerCase();
      const email = (s?.email || '').toString().toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [students, searchTerm]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return (students || []).find((s) => String(s?.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!teacherId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notes
        </Typography>
        <Alert severity="error">
          Unable to load teacher notes because your teacher profile ID is missing. Please log out and log in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notes
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Private notes per student (only visible to you).
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Students
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ mb: 1 }} />

            {filteredStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No students found.
              </Typography>
            ) : (
              <List dense disablePadding>
                {filteredStudents.map((s) => {
                  const id = s?.id;
                  const name = `${s?.name || ''} ${s?.lastName || ''}`.trim() || 'Student';
                  const secondary = s?.phoneNumber || s?.email || '';

                  return (
                    <ListItemButton
                      key={id}
                      selected={String(selectedStudentId) === String(id)}
                      onClick={() => setSelectedStudentId(String(id))}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText primary={name} secondary={secondary} />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedStudent ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {`${selectedStudent?.name || ''} ${selectedStudent?.lastName || ''}`.trim() || 'Student'}
              </Typography>
              <NotesToSelfPanel studentId={selectedStudentId} teacherId={teacherId} />
            </Box>
          ) : (
            <Alert severity="info">Select a student to start writing notes.</Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherNotesPage;
