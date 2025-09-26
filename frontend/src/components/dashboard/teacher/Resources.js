import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Paper, TextField, MenuItem, CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { 
  getTeacherResources, 
  uploadResource,
  deleteResource 
} from '../../../services/teacherService';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: acceptedFiles => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (error.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a valid document, image, or text file.');
      } else {
        setError('Error uploading file. Please try again.');
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resourcesData, classesData] = await Promise.all([
          getTeacherResources(),
          getTeacherClasses()
        ]);
        setResources(resourcesData);
        setClasses(classesData);
        // Set the first class as selected if available
        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', selectedClass);
      
      const newResource = await uploadResource(formData);
      
      setResources([newResource, ...resources]);
      setFile(null);
      setSuccess('Resource uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await deleteResource(id);
      setResources(resources.filter(r => r.id !== id));
      setSuccess('Resource deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const filteredResources = selectedClass === 'all' 
    ? resources 
    : resources.filter(r => r.classId === selectedClass);

  const getFileType = (filename) => {
    if (!filename) return 'File';
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Word';
    if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'Image';
    if (['txt'].includes(ext)) return 'Text';
    return 'File';
  };

  if (loading && resources.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Resources</Typography>
        <TextField
          select
          size="small"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={classes.length === 0}
        >
          {classes.length === 0 ? (
            <MenuItem value="">No classes available</MenuItem>
          ) : (
            [
              <MenuItem key="all" value="all">All Classes</MenuItem>,
              ...classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))
            ]
          )}
        </TextField>
      </Box>

      <Box 
        {...getRootProps()} 
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          p: 3,
          textAlign: 'center',
          mb: 3,
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          }
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        <CloudUploadIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
        <Typography>
          {file 
            ? `Selected: ${file.name}` 
            : isDragActive 
              ? 'Drop the file here' 
              : 'Drag & drop a file here, or click to select'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          PDF, DOC, PPT, TXT, or Images (Max: 5MB)
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          onClick={() => document.querySelector('input[type="file"]').click()}
          disabled={uploading}
        >
          Select File
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading || !selectedClass || classes.length === 0}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        {selectedClass === 'all' ? 'All Resources' : 'Class Resources'}
      </Typography>
      
      {filteredResources.length > 0 ? (
        <List>
          {filteredResources.map((resource) => (
            <ListItem key={resource.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {resource.name}
                    <Chip 
                      label={getFileType(resource.name)} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                }
                secondary={
                  <>
                    {resource.className && (
                      <Chip 
                        label={resource.className} 
                        size="small" 
                        sx={{ mr: 1 }}
                        variant="outlined"
                      />
                    )}
                    {new Date(resource.uploadedAt).toLocaleDateString()}
                    {resource.description && (
                      <Box component="span" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                        {resource.description}
                      </Box>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  href={`/api/teacher/resources/download/${resource.id}`} 
                  download
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  onClick={() => handleDelete(resource.id)} 
                  disabled={uploading}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No resources found. Upload a file to get started.
        </Typography>
      )}
    </Paper>
  );
};

export default TeacherResources;