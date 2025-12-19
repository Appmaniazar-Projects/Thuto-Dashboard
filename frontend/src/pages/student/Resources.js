import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Book as BookIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  FindInPage as FindInPageIcon,
} from '@mui/icons-material';
import { getMyResources, downloadResource } from '../../services/resourceService';
import subjectService from '../../services/subjectService';
import gradeService from '../../services/gradeService';
import { format } from 'date-fns';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const [resourcesData, subjectsData, gradesData] = await Promise.all([
          getMyResources().catch(() => []),
          subjectService.getSchoolSubjects().catch(() => []),
          gradeService.getSchoolGrades().catch(() => [])
        ]);

        const normalizedResources = Array.isArray(resourcesData)
          ? resourcesData
          : Array.isArray(resourcesData?.data)
            ? resourcesData.data
            : Array.isArray(resourcesData?.resources)
              ? resourcesData.resources
              : [];

        setResources(normalizedResources);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        
        // Only show error message for actual API failures, not empty data
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please check your connection and try again.');
        } else if (err.response?.status === 404) {
          // 404 might mean no resources exist, which is not an error
          setResources([]);
          setError('');
        } else {
          setError('Failed to load resources. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let result = [...resources];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const title = (r.title || r.fileName || r.name || '').toLowerCase();
        const description = (r.description || '').toLowerCase();
        return title.includes(q) || description.includes(q);
      });
    }
    if (selectedSubject !== 'all') {
      result = result.filter((r) => String(r.subjectId) === String(selectedSubject));
    }
    if (selectedGrade !== 'all') {
      result = result.filter((r) => String(r.gradeId) === String(selectedGrade));
    }
    setFilteredResources(result);
  }, [searchTerm, selectedSubject, selectedGrade, resources]);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      await downloadResource(fileUrl, fileName);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the resource.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSelectedGrade('all');
  };

  const getSubjectLabel = (subjectId) => {
    if (!subjectId) return null;
    return subjects.find((s) => String(s.id) === String(subjectId))?.name || `Subject ${subjectId}`;
  };

  const getGradeLabel = (gradeId) => {
    if (!gradeId) return null;
    return grades.find((g) => String(g.id) === String(gradeId))?.name || `Grade ${gradeId}`;
  };

  const availableSubjects = [
    { id: 'all', name: 'All Subjects' },
    ...subjects.map((s) => ({ id: String(s.id), name: s.name }))
  ];

  const availableGrades = [
    { id: 'all', name: 'All Grades' },
    ...grades.map((g) => ({ id: String(g.id), name: g.name }))
  ];

  const getFileTypeLabel = (resource) => {
    const fileName = resource?.fileName || resource?.name || '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Word';
    if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
    if (['txt'].includes(ext)) return 'Text';
    return 'File';
  };

  const isImageResource = (resource) => {
    const type = resource?.fileType || '';
    if (typeof type === 'string' && type.startsWith('image/')) return true;
    const fileName = resource?.fileName || resource?.name || '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const getUploadDateLabel = (resource) => {
    if (!resource) return null;
    const rawDate = resource.uploadDate || resource.uploadedAt || resource.createdAt;
    if (!rawDate) return null;
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Resources
        </Typography>
        <Typography variant="body1">
          Find and download study materials, notes, and other resources for your subjects.
        </Typography>
      

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterIcon color="action" />
          <TextField
            placeholder="Search resources..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Subject</InputLabel>
            <Select
              name="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              label="Subject"
            >
              {availableSubjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel>Grade</InputLabel>
            <Select
              name="grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              label="Grade"
            >
              {availableGrades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Clear Filters">
            <IconButton onClick={clearFilters} disabled={!searchTerm && selectedSubject === 'all' && selectedGrade === 'all'}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {filteredResources.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FindInPageIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {resources.length === 0 ? 'No resources available yet.' : 'No resources match your filters.'}
          </Typography>
          {resources.length > 0 && (searchTerm || selectedSubject !== 'all') && (
            <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 1 }}>
              Clear filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((resource) => {
            const uploadLabel = getUploadDateLabel(resource);
            const displayTitle = resource.title || resource.fileName || resource.name || 'Untitled resource';
            const subjectLabel = getSubjectLabel(resource.subjectId);
            const gradeLabel = getGradeLabel(resource.gradeId);
            const fileUrl = resource.fileUrl || resource.downloadURL || resource.downloadUrl;
            return (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BookIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {displayTitle}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip label={getFileTypeLabel(resource)} size="small" variant="outlined" color="primary" />
                      {subjectLabel && <Chip label={subjectLabel} size="small" variant="outlined" />}
                      {gradeLabel && <Chip label={gradeLabel} size="small" variant="outlined" />}
                    </Box>

                    {isImageResource(resource) && fileUrl && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 160,
                          borderRadius: 1,
                          overflow: 'hidden',
                          backgroundColor: 'action.hover',
                          mb: 2
                        }}
                      >
                        <img
                          src={fileUrl}
                          alt={displayTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </Box>
                    )}

                    {resource.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resource.description}
                      </Typography>
                    )}
                    {uploadLabel && (
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {uploadLabel}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(fileUrl, resource.fileName || displayTitle)}
                      disabled={!fileUrl}
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Resources;

                        