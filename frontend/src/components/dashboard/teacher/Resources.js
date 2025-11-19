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
import subjectService from '../../../services/subjectService';
import gradeService from '../../../services/gradeService';

const TeacherResources = () => {
  const [allResources, setAllResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter resources when subject or grade changes
  useEffect(() => {
    if (allResources.length === 0) {
      setFilteredResources([]);
      return;
    }

    let filtered = allResources.filter(resource => {
      const matchesSubject = !selectedSubject || resource.subjectId == selectedSubject;
      const matchesGrade = !selectedGrade || resource.gradeId == selectedGrade;
      return matchesSubject && matchesGrade;
    });

    // Update filtered resources if needed
    let updatedFiltered = [newResource, ...filteredResources];
    if (selectedSubject && newResource.subjectId !== selectedSubject) {
      updatedFiltered = updatedFiltered.filter(r => r.subjectId === selectedSubject);
    }
    if (selectedGrade && newResource.gradeId !== selectedGrade) {
      updatedFiltered = updatedFiltered.filter(r => r.gradeId === selectedGrade);
    }
    setFilteredResources(updatedFiltered);
  }, [selectedSubject, selectedGrade, allResources]);

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
        setError('');
        const [resourcesData, subjectsData, gradesData] = await Promise.all([
          getTeacherResources().catch(err => {
            console.error('Error fetching resources:', err);
            return [];
          }),
          subjectService.getSchoolSubjects().catch(err => {
            console.error('Error fetching subjects:', err);
            return [];
          }),
          gradeService.getSchoolGrades().catch(err => {
            console.error('Error fetching grades:', err);
            return [];
          })
        ]);
        setAllResources(resourcesData || []);
        setSubjects(subjectsData || []);
        setGrades(gradesData || []);
        
        if (!resourcesData) {
          setError('No resources found. Upload your first resource to get started!');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load resources. The server encountered an error. Please try again later.');
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
    
    if (!selectedSubject || !selectedGrade) {
      setError('Please select a subject and grade');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      const resourceMetadata = {
        title: file.name.split('.')[0], // Use filename as title
        description: `Resource for ${subjects.find(s => s.id === selectedSubject)?.name || 'subject'}`,
        category: 'teaching-material',
        subjectId: selectedSubject,
        gradeId: selectedGrade
      };
      
      const newResource = await uploadResource(file, resourceMetadata);
      
      // Add the new resource to the beginning of the list and update both states
      const updatedResources = [newResource, ...allResources];
      setAllResources(updatedResources);
      
      // Update filtered resources if needed
      let filtered = [newResource, ...filteredResources];
      if (selectedSubject && newResource.subjectId !== selectedSubject) {
        filtered = filtered.filter(r => r.subjectId === selectedSubject);
      }
      if (selectedGrade && newResource.gradeId !== selectedGrade) {
        filtered = filtered.filter(r => r.gradeId === selectedGrade);
      }
      setFilteredResources(filtered);
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

  const handleDownload = async (resourceId, fileName, fileUrl) => {
    try {
      setLoading(true);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      setSuccess(`Downloading ${fileName}...`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await deleteResource(id);
      const updatedResources = allResources.filter(r => r.id !== id);
      setAllResources(updatedResources);
      setFilteredResources(filteredResources.filter(r => r.id !== id));
      setSuccess('Resource deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  // Filtering is handled by the useEffect hook above

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

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (loading && allResources.length === 0) {
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
      </Box>

      {/* Subject and Grade Selection */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={uploading}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          label="Grade"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={uploading}
        >
          {grades.map((grade) => (
            <MenuItem key={grade.id} value={grade.id}>
              {grade.name}
            </MenuItem>
          ))}
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
          disabled={!file || uploading || !selectedGrade || !selectedSubject}
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
        {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'} found
        {selectedSubject && ` for selected subject`}
        {selectedGrade && ` and grade`}
      </Typography>
      
      {filteredResources.length > 0 ? (
        <List>
          {filteredResources.map((resource) => {
            const displayName = resource.title || resource.fileName || resource.name || 'Untitled resource';
            const fileNameForType = resource.fileName || resource.name || resource.title || '';
            const subjectName = subjects.find((subject) => subject.id == resource.subjectId)?.name
              || resource.subject
              || resource.subjectName;
            const gradeName = grades.find((grade) => grade.id == resource.gradeId)?.name
              || resource.grade
              || resource.gradeName;
            const uploadedAt = resource.uploadDate || resource.uploadedAt;
            const fileSizeLabel = resource.fileSize ? formatFileSize(resource.fileSize) : null;

            return (
              <ListItem key={resource.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {displayName}
                      <Chip 
                        label={getFileType(fileNameForType)} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                        {subjectName && (
                          <Chip 
                            label={subjectName} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            variant="outlined"
                          />
                        )}
                        {gradeName && (
                          <Chip 
                            label={gradeName} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            variant="outlined"
                          />
                        )}
                        {resource.className && (
                          <Chip 
                            label={resource.className} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {(uploadedAt || fileSizeLabel) && (
                        <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                          {uploadedAt && new Date(uploadedAt).toLocaleString()}
                          {uploadedAt && fileSizeLabel && ' • '}
                          {fileSizeLabel}
                        </Box>
                      )}
                      {resource.fileName && (
                        <Box component="span" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                          {resource.fileName}
                        </Box>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDownload(resource.id, resource.fileName || displayName || 'resource', resource.fileUrl)}
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
            );
          })}
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