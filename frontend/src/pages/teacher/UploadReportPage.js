import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Paper, TextField, MenuItem, CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDropzone } from 'react-dropzone';
import { 
  getTeacherResources, 
  uploadResource,
  deleteResource
} from '../../services/teacherService';
import subjectService from '../../services/subjectService';
import gradeService from '../../services/gradeService';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter resources when subject or grade changes
  useEffect(() => {
    if (!Array.isArray(allResources) || allResources.length === 0) {
      setFilteredResources([]);
      return;
    }

    const filtered = allResources.filter(resource => {
      const matchesSubject = !selectedSubject || resource.subjectId == selectedSubject;
      const matchesGrade = !selectedGrade || resource.gradeId == selectedGrade;
      return matchesSubject && matchesGrade;
    });

    setFilteredResources(filtered);
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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = localStorage.getItem('schoolId') || userInfo.schoolId;
      
      console.log('Fetching data with schoolId:', schoolId);
      
      const [resourcesData, subjectsData, gradesData] = await Promise.all([
        getTeacherResources().catch(err => {
          console.error('Error fetching resources:', err);
          // Log the actual error response
          if (err.response) {
            console.error('Response error:', err.response.data);
            console.error('Response status:', err.response.status);
          }
          return [];
        }),
        subjectService.getSchoolSubjects().catch(err => {
          console.error('Error fetching subjects:', err);
          return [];
        }),
        gradeService.getSchoolGrades(schoolId).catch(err => {
          console.error('Error fetching grades:', err);
          return [];
        })
      ]);

      console.log('Raw resources data:', resourcesData);
      console.log('Raw subjects data:', subjectsData);
      console.log('Raw grades data:', gradesData);

      // Normalize resources response
      const normalizedResources = Array.isArray(resourcesData)
        ? resourcesData
        : Array.isArray(resourcesData?.data)
          ? resourcesData.data
          : Array.isArray(resourcesData?.resources)
            ? resourcesData.resources
            : resourcesData?.resource // Handle single resource
              ? [resourcesData.resource]
              : [];

      console.log('Normalized resources:', normalizedResources);

      setAllResources(normalizedResources);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!selectedSubject || !selectedGrade) {
      setError('Please select both subject and grade');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setSuccess('');
      
      const selectedSubjectObj = subjects.find((s) => String(s.id) === String(selectedSubject));
      const selectedGradeObj = grades.find((g) => String(g.id) === String(selectedGrade));
      
      const resourceMetadata = {
        title: file.name.split('.')[0],
        description: `${selectedSubjectObj?.name || 'Resource'} for ${selectedGradeObj?.name || 'grade'}`,
        category: 'teaching-material',
        subjectId: selectedSubject,
        gradeId: selectedGrade,
        targetAudience: 'students'
      };
      
      console.log('Uploading resource with metadata:', resourceMetadata);
      
      // Upload with progress tracking
      const newResource = await uploadResource(
        file, 
        resourceMetadata,
        (progress) => {
          setUploadProgress(Math.round(progress));
          console.log('Upload progress:', progress + '%');
        }
      );
      
      console.log('Upload response:', newResource);
      
      // Verify the resource was saved
      if (!newResource || !newResource.id) {
        throw new Error('Resource was not saved properly. No ID returned.');
      }
      
      setSuccess(`Resource "${file.name}" uploaded successfully!`);
      
      // Clear form
      setFile(null);
      setUploadProgress(0);
      
      // Refresh the entire resource list from backend to ensure sync
      await fetchAllData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to upload resource. Please check your connection and try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (resourceId, fileName, fileUrl) => {
    try {
      if (!fileUrl) {
        throw new Error('File URL not found');
      }

      setSuccess(`Downloading ${fileName}...`);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download resource. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError('');
      console.log('Deleting resource:', id);
      
      await deleteResource(id);
      
      // Remove from local state immediately for better UX
      const updatedResources = allResources.filter(r => r.id !== id);
      setAllResources(updatedResources);
      setFilteredResources(filteredResources.filter(r => r.id !== id));
      
      setSuccess('Resource deleted successfully!');
      
      // Refresh from backend to ensure sync
      setTimeout(() => {
        fetchAllData();
      }, 1000);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete resource. Please try again.');
      
      // Refresh to get accurate state
      fetchAllData();
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Resources</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchAllData}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Subject and Grade Selection */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Select Subject *"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          disabled={uploading || subjects.length === 0}
          error={!selectedSubject && file !== null}
        >
          {subjects.length === 0 ? (
            <MenuItem disabled>No subjects available</MenuItem>
          ) : (
            subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))
          )}
        </TextField>
        
        <TextField
          select
          label="Select Grade *"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          disabled={uploading || grades.length === 0}
          error={!selectedGrade && file !== null}
        >
          {grades.length === 0 ? (
            <MenuItem disabled>No grades available</MenuItem>
          ) : (
            grades.map((grade) => (
              <MenuItem key={grade.id} value={grade.id}>
                {grade.name}
              </MenuItem>
            ))
          )}
        </TextField>
      </Box>

      {/* File Upload Area */}
      <Box 
        {...getRootProps()} 
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          p: 3,
          textAlign: 'center',
          mb: 2,
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          borderRadius: 1,
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          }
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        <CloudUploadIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
        <Typography variant="body1" gutterBottom>
          {file 
            ? `Selected: ${file.name}` 
            : isDragActive 
              ? 'Drop the file here' 
              : 'Drag & drop a file here, or click to select'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, Images (Max: 10MB)
        </Typography>
      </Box>

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Uploading...</Typography>
            <Typography variant="caption">{uploadProgress}%</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 4, bgcolor: 'grey.300', borderRadius: 1 }}>
            <Box 
              sx={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                bgcolor: 'primary.main',
                borderRadius: 1,
                transition: 'width 0.3s ease'
              }} 
            />
          </Box>
        </Box>
      )}

      {/* Upload Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading || !selectedGrade || !selectedSubject}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          size="large"
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Resource'}
        </Button>
      </Box>

      {/* Error and Success Messages */}
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

      <Divider sx={{ my: 3 }} />

      {/* Resources List Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
          {(selectedSubject || selectedGrade) && ' (filtered)'}
        </Typography>
        {(selectedSubject || selectedGrade) && (
          <Button 
            size="small" 
            onClick={() => {
              setSelectedSubject('');
              setSelectedGrade('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>
      
      {/* Resources List */}
      {filteredResources.length > 0 ? (
        <List>
          {filteredResources.map((resource) => {
            const displayName = resource.title || resource.fileName || resource.name || 'Untitled resource';
            const fileNameForType = resource.fileName || resource.name || resource.title || '';
            const uploadedAt = resource.uploadDate || resource.uploadedAt || resource.createdAt;
            const fileSizeLabel = resource.fileSize ? formatFileSize(resource.fileSize) : null;

            return (
              <ListItem key={resource.id} divider sx={{ py: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body1" component="span">
                        {displayName}
                      </Typography>
                      <Chip 
                        label={getFileType(fileNameForType)} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {/* Subject and Grade Chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {resource.subjectId && (
                          <Chip 
                            label={subjects.find(s => s.id == resource.subjectId)?.name || `Subject ${resource.subjectId}`} 
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                        {resource.gradeId && (
                          <Chip 
                            label={grades.find(g => g.id == resource.gradeId)?.name || `Grade ${resource.gradeId}`} 
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                      
                      {/* File Info */}
                      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {uploadedAt && (
                          <Typography variant="caption" display="block">
                            Uploaded: {new Date(uploadedAt).toLocaleString()}
                          </Typography>
                        )}
                        {fileSizeLabel && (
                          <Typography variant="caption" display="block">
                            Size: {fileSizeLabel}
                          </Typography>
                        )}
                        {resource.description && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {resource.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDownload(
                      resource.id, 
                      resource.fileName || displayName || 'resource', 
                      resource.fileUrl
                    )}
                    sx={{ mr: 1 }}
                    disabled={!resource.fileUrl}
                    title="Download"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDelete(resource.id)} 
                    disabled={uploading}
                    title="Delete"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(selectedSubject || selectedGrade) 
              ? 'Try adjusting your filters or upload a new resource.'
              : 'Upload your first resource to get started!'}
          </Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default TeacherResources;