import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import {
  createTeacherNote,
  deleteTeacherNote,
  getTeacherNotes,
  updateTeacherNote,
  exportStudentNotes,
} from '../../services/notesService';

const safeDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const formatLastUpdated = (value) => {
  const d = safeDate(value);
  if (!d) return 'Date: —';
  return `Date: ${format(d, 'dd/MM/yyyy, HH:mm')}`;
};

const normalizeTeacherId = (teacherId) => {
  if (teacherId === null || teacherId === undefined) return '';
  return String(teacherId);
};

const normalizeStudentId = (studentId) => {
  if (studentId === null || studentId === undefined) return '';
  return String(studentId);
};

const NotesToSelfPanel = ({ studentId, teacherId }) => {
  const { enqueueSnackbar } = useSnackbar();

  const stableTeacherId = useMemo(() => normalizeTeacherId(teacherId), [teacherId]);
  const stableStudentId = useMemo(() => normalizeStudentId(studentId), [studentId]);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  const trimmedContent = content.trim();

  const sortedNotes = useMemo(() => {
    return [...(notes || [])].sort((a, b) => {
      const aTime = safeDate(a.updated_at || a.created_at || a.updatedAt || a.createdAt || a.noteDate)?.getTime() ?? 0;
      const bTime = safeDate(b.updated_at || b.created_at || b.updatedAt || b.createdAt || b.noteDate)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [notes]);

  const loadNotes = useCallback(async () => {
    if (!stableStudentId || !stableTeacherId) {
      setNotes([]);
      return;
    }

    try {
      setLoading(true);
      setWarning('');
      const data = await getTeacherNotes({ studentId: stableStudentId, teacherId: stableTeacherId });
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      const apiMessage = e?.response?.data?.message || e?.response?.data || e?.message;
      setWarning(`Notes could not be loaded. ${apiMessage ? `(${apiMessage})` : ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [stableStudentId, stableTeacherId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const startEdit = (note) => {
    setEditingId(note.id);
    setContent(note.note || note.content || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setContent('');
  };

  const handleSave = async () => {
    if (!stableStudentId || !stableTeacherId) return;
    if (!trimmedContent) return;

    try {
      if (editingId) {
        await updateTeacherNote({
          id: editingId,
          note: trimmedContent,
          noteDate: new Date(),
          teacherId: stableTeacherId,
          studentId: stableStudentId,
        });
        enqueueSnackbar('Note updated', { variant: 'success' });
      } else {
        await createTeacherNote({
          studentId: stableStudentId,
          teacherId: stableTeacherId,
          note: trimmedContent,
          noteDate: new Date(),
        });
        enqueueSnackbar('Note saved', { variant: 'success' });
      }

      setContent('');
      setEditingId(null);
      await loadNotes();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to save note', { variant: 'error' });
    }
  };

  const handleDelete = async (note) => {
    const ok = window.confirm('Delete this note?');
    if (!ok) return;

    try {
      await deleteTeacherNote({ id: note.id });
      enqueueSnackbar('Note deleted', { variant: 'info' });

      if (editingId === note.id) {
        setEditingId(null);
        setContent('');
      }

      await loadNotes();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to delete note', { variant: 'error' });
    }
  };

  const canSave = Boolean(stableStudentId && stableTeacherId && trimmedContent && !loading);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
            <Box>
              <Typography variant="h6">Notes to Self</Typography>
              <Typography variant="body2" color="text.secondary">
                🔒 Private – only visible to you
              </Typography>
            </Box>
          </Stack>

          {!stableStudentId ? (
            <Alert severity="info">Select a student to view and create notes.</Alert>
          ) : null}

          {warning ? <Alert severity="warning">{warning}</Alert> : null}

          <TextField
            fullWidth
            multiline
            minRows={4}
            label={editingId ? 'Edit note' : 'New note'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a private note for this student..."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!canSave}
              sx={{ minHeight: 44 }}
            >
              {editingId ? 'Update' : 'Save'}
            </Button>

            <Button
              variant="outlined"
              onClick={cancelEdit}
              disabled={!editingId && !content}
              startIcon={<CloseIcon />}
              sx={{ minHeight: 44 }}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              onClick={loadNotes}
              disabled={loading || !stableStudentId || !stableTeacherId}
              sx={{ minHeight: 44, ml: { sm: 'auto' } }}
            >
              Refresh
            </Button>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Your notes
            </Typography>

            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading notes...
              </Typography>
            ) : sortedNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notes yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {sortedNotes.map((note) => (
                  <Card key={note.id} variant="outlined">
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            {formatLastUpdated(note.updated_at || note.created_at || note.updatedAt || note.createdAt)}
                            {/* Debug: {JSON.stringify({updatedAt: note.updated_at, createdAt: note.created_at, note})} */}
                          </Typography>

                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              aria-label="edit"
                              onClick={() => startEdit(note)}
                              sx={{ minHeight: 44, minWidth: 44 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDelete(note)}
                              sx={{ minHeight: 44, minWidth: 44 }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {note.note || note.content || ''}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NotesToSelfPanel;
