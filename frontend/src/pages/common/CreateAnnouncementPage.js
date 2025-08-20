import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createAnnouncement } from '../../services/announcementService';
import PageTitle from '../../components/common/PageTitle';

const CreateAnnouncementPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Both title and content are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createAnnouncement({ title, content });
      enqueueSnackbar('Announcement created successfully!', { variant: 'success' });
      navigate('/announcements');
    } catch (err) {
      setError('Failed to create announcement. Please try again.');
      console.error(err);
      enqueueSnackbar(error, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageTitle title="Create Announcement" subtitle="Post news and updates for all users of the school." />
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: '800px' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          required
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          required
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          multiline
          rows={8}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/announcements')} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Publish Announcement'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateAnnouncementPage;
