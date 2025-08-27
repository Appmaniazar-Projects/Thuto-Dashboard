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
import { getAvailableResources, downloadResource } from '../../services/studentService';
import { format } from 'date-fns';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableResources();
        setResources(data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let result = [...resources];
    if (searchTerm) {
      result = result.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedSubject !== 'all') {
      result = result.filter(r => r.subject === selectedSubject);
    }
    setFilteredResources(result);
  }, [searchTerm, selectedSubject, resources]);

  const handleDownload = async (resourceId, fileName) => {
    try {
      await downloadResource(resourceId, fileName);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the resource.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
  };

  const availableSubjects = ['all', ...new Set(resources.map(r => r.subject))];

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
                <MenuItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Clear Filters">
            <IconButton onClick={clearFilters} disabled={!searchTerm && selectedSubject === 'all'}>
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
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <BookIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {resource.title}
                    </Typography>
                  </Box>
                  <Chip label={resource.subject} size="small" variant="outlined" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {resource.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {format(new Date(resource.uploadDate), 'MMM d, yyyy')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(resource.id, resource.fileName)}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Resources;

                        