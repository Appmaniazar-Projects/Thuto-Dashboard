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
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [selectedVisibilityFilter, setSelectedVisibilityFilter] = useState('');

  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadGrade, setUploadGrade] = useState('');

  const [visibilityType, setVisibilityType] = useState('PUBLIC');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedGradeIds, setSelectedGradeIds] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter resources when subject or grade changes
  useEffect(() => {

    if (!Array.isArray(allResources) || allResources.length === 0) {
      setFilteredResources([]);
      return;
    }

    const filtered = allResources.filter(resource => {
      const normalizedVisibility = (resource.visibilityType || '').toString().toUpperCase();
      const resourceSubjectId = resource.subjectId ?? resource.subject?.id ?? null;
      const resourceGradeId = resource.gradeId ?? resource.grade?.id ?? null;

      const resourceSubjectIds = Array.isArray(resource.subjectIds)
        ? resource.subjectIds
        : resourceSubjectId !== null && resourceSubjectId !== undefined
        ? [resourceSubjectId]
        : [];

      const resourceGradeIds = Array.isArray(resource.gradeIds)
        ? resource.gradeIds
        : resourceGradeId !== null && resourceGradeId !== undefined
        ? [resourceGradeId]
        : [];

      const matchesVisibility =
        !selectedVisibilityFilter ||
        (selectedVisibilityFilter === 'PUBLIC' && normalizedVisibility === 'PUBLIC') ||
        (selectedVisibilityFilter === 'GRADE_SUBJECT' && normalizedVisibility === 'GRADE_SUBJECT');

      const matchesSubject =
        !filterSubject ||
        resourceSubjectIds.some((sid) => String(sid) === String(filterSubject));
      const matchesGrade =
        !filterGrade ||
        resourceGradeIds.some((gid) => String(gid) === String(filterGrade));

      return matchesVisibility && matchesSubject && matchesGrade;
    });

    setFilteredResources(filtered);
  }, [filterSubject, filterGrade, selectedVisibilityFilter, allResources]);

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
    maxSize: 5 * 1024 * 1024, // 5MB
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
        const normalizedResources = Array.isArray(resourcesData)
          ? resourcesData
          : Array.isArray(resourcesData?.data)
            ? resourcesData.data
            : Array.isArray(resourcesData?.resources)
              ? resourcesData.resources
              : [];

        setAllResources(normalizedResources);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        
        if (normalizedResources.length === 0) {
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

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (visibilityType === 'GRADE_SUBJECT') {
      if (!selectedSubjectIds.length || !selectedGradeIds.length) {
        setError('Please select at least one grade and one subject');
        return;
      }
    }
    
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const selectedSubjectObj = subjects.find((s) => String(s.id) === String(selectedSubjectIds?.[0] ?? uploadSubject));
      const resourceMetadata = {
        title: title.trim(),
        description: description.trim() || `Resource for ${selectedSubjectObj?.name || 'subject'}`,
        category: 'teaching-material',
        visibilityType,
        subjectId: visibilityType === 'GRADE_SUBJECT' ? '' : uploadSubject,
        gradeId: visibilityType === 'GRADE_SUBJECT' ? '' : uploadGrade,
        subjectIds: visibilityType === 'GRADE_SUBJECT' ? selectedSubjectIds : [],
        gradeIds: visibilityType === 'GRADE_SUBJECT' ? selectedGradeIds : []
      };
      
      const newResource = await uploadResource(file, resourceMetadata);
      
      // Add the new resource to the beginning of the list and update both states
      const updatedResources = [newResource, ...allResources];
      setAllResources(updatedResources);
      
      // Update filtered resources if needed
      let filtered = [newResource, ...filteredResources];
      if (filterSubject && newResource.subjectId !== filterSubject) {
        filtered = filtered.filter(r => r.subjectId === filterSubject);
      }
      if (filterGrade && newResource.gradeId !== filterGrade) {
        filtered = filtered.filter(r => r.gradeId === filterGrade);
      }
      setFilteredResources(filtered);
      setFile(null);
      setSuccess('Resource uploaded successfully!');
      setFilterSubject('');
      setFilterGrade('');
      setUploadSubject('');
      setUploadGrade('');
      setTitle('');
      setDescription('');
      setVisibilityType('PUBLIC');
      setSelectedGradeIds([]);
      setSelectedSubjectIds([]);
      
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

      {/* Upload Details */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ minWidth: 240, flexGrow: 1 }}
          disabled={uploading}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ minWidth: 240, flexGrow: 1 }}
          disabled={uploading}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Visibility"
          value={visibilityType}
          onChange={(e) => {
            const value = e.target.value;
            setVisibilityType(value);
            if (value === 'PUBLIC') {
              setSelectedGradeIds([]);
              setSelectedSubjectIds([]);
            }
          }}
          sx={{ minWidth: 240 }}
          disabled={uploading}
        >
          <MenuItem value="PUBLIC">Public (all teachers)</MenuItem>
          <MenuItem value="GRADE_SUBJECT">Grade + Subject (restricted)</MenuItem>
        </TextField>

        {visibilityType === 'GRADE_SUBJECT' ? (
          <>
            <TextField
              select
              label="Subjects"
              SelectProps={{ multiple: true }}
              value={selectedSubjectIds}
              onChange={(e) => setSelectedSubjectIds(e.target.value)}
              sx={{ minWidth: 240 }}
              disabled={uploading}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Grades"
              SelectProps={{ multiple: true }}
              value={selectedGradeIds}
              onChange={(e) => setSelectedGradeIds(e.target.value)}
              sx={{ minWidth: 240 }}
              disabled={uploading}
            >
              {grades.map((grade) => (
                <MenuItem key={grade.id} value={String(grade.id)}>
                  {grade.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : (
          <>
            <TextField
              select
              label="Subject"
              value={uploadSubject}
              onChange={(e) => setUploadSubject(e.target.value)}
              sx={{ minWidth: 200 }}
              disabled={uploading}
            >
              <MenuItem value="">All subjects</MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Grade"
              value={uploadGrade}
              onChange={(e) => setUploadGrade(e.target.value)}
              sx={{ minWidth: 200 }}
              disabled={uploading}
            >
              <MenuItem value="">All grades</MenuItem>
              {grades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id}>
                  {grade.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
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
          disabled={
            !file ||
            uploading ||
            !title.trim() ||
            (visibilityType === 'GRADE_SUBJECT'
              ? !selectedGradeIds.length || !selectedSubjectIds.length
              : false)
          }
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

      {/* List Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Visibility"
          value={selectedVisibilityFilter}
          onChange={(e) => setSelectedVisibilityFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PUBLIC">Public</MenuItem>
          <MenuItem value="GRADE_SUBJECT">Grade + Subject</MenuItem>
        </TextField>
        <TextField
          select
          label="Subject"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All subjects</MenuItem>
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Grade"
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All grades</MenuItem>
          {grades.map((grade) => (
            <MenuItem key={grade.id} value={grade.id}>
              {grade.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'} found
        {filterSubject && ` for selected subject`}
        {filterGrade && ` and grade`}
      </Typography>
      
      {filteredResources.length > 0 ? (
        <List>
          {filteredResources.map((resource) => {
            const displayName = resource.title || resource.fileName || resource.name || 'Untitled resource';
            const fileNameForType = resource.fileName || resource.name || resource.title || '';
            const uploadedAt = resource.uploadDate || resource.uploadedAt;
            const fileSizeLabel = resource.fileSize ? formatFileSize(resource.fileSize) : null;

            return (
              <ListItem key={resource.id} divider>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {displayName}
                      {(resource.visibilityType || '').toString().toUpperCase() === 'PUBLIC' && (
                        <Chip label="Public" size="small" variant="outlined" />
                      )}
                      {(resource.visibilityType || '').toString().toUpperCase() === 'GRADE_SUBJECT' && (
                        <Chip label="Grade + Subject" size="small" variant="outlined" />
                      )}
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
                        {resource.className && (
                          <Chip 
                            label={resource.className} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                        {resource.subjectId && (
                          <Chip 
                            label={subjects.find(s => s.id == resource.subjectId)?.name || `Subject ${resource.subjectId}`} 
                            size="small" 
                            sx={{ mr: 0.5 }}
                            variant="outlined"
                          />
                        )}
                        {resource.gradeId && (
                          <Chip 
                            label={grades.find(g => g.id == resource.gradeId)?.name || `Grade ${resource.gradeId}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {(uploadedAt || fileSizeLabel) && (
                        <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                          {uploadedAt && new Date(uploadedAt).toLocaleString()}
                          {uploadedAt && fileSizeLabel && ' \u2022 '}
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