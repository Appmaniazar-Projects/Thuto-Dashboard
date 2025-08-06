import React, { useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, TextField
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

const mockResources = [
  { id: 1, name: 'Photosynthesis Notes.pdf', date: '2025-07-10', url: '#' },
  { id: 2, name: 'Algebra Worksheet.docx', date: '2025-07-09', url: '#' },
];

const TeacherResources = () => {
  const [resources, setResources] = useState(mockResources);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      const newResource = {
        id: resources.length + 1,
        name: file.name,
        date: new Date().toISOString().slice(0, 10),
        url: '#',
      };
      setResources([newResource, ...resources]);
      setFile(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Upload Resources for Students</Typography>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        <TextField
          value={file ? file.name : ''}
          placeholder="No file selected"
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>Uploaded Resources</Typography>
      <List>
        {resources.map((res) => (
          <ListItem key={res.id} divider>
            <ListItemText
              primary={res.name}
              secondary={`Uploaded: ${res.date}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" href={res.url} download>
                <DownloadIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TeacherResources; 