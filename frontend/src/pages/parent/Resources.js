import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  FindInPage as FindInPageIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  downloadResource,
  getResourcesByGrade,
  getResourcesBySubject,
  getResourcesBySubjectAndGrade,
} from '../../services/resourceService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';
import { formatDisplayDate } from '../../utils/date';

const ParentResources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);

  const normalizeResources = (resourcesData) => {
    if (Array.isArray(resourcesData)) return resourcesData;
    if (Array.isArray(resourcesData?.data)) return resourcesData.data;
    if (Array.isArray(resourcesData?.resources)) return resourcesData.resources;
    return [];
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [subjectsData, gradesData] = await Promise.all([
          subjectService.getSchoolSubjects().catch(() => []),
          gradeService.getSchoolGrades().catch(() => []),
        ]);

        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
      } catch (err) {
        console.error('Failed to fetch parent resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const parentInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const schoolId = parentInfo?.schoolId || localStorage.getItem('schoolId');

        let resourcesData = [];
        if (selectedSubject !== 'all' && selectedGrade !== 'all') {
          resourcesData = await getResourcesBySubjectAndGrade(selectedSubject, selectedGrade, schoolId);
        } else if (selectedSubject !== 'all') {
          resourcesData = await getResourcesBySubject(selectedSubject, schoolId);
        } else if (selectedGrade !== 'all') {
          resourcesData = await getResourcesByGrade(selectedGrade, schoolId);
        } else {
          const gradeIds = (grades || []).map((g) => g?.id).filter(Boolean);
          if (!gradeIds.length) {
            resourcesData = [];
          } else {
            const results = await Promise.allSettled(
              gradeIds.map((gid) => getResourcesByGrade(gid, schoolId))
            );
            const merged = results.flatMap((r) => (r.status === 'fulfilled' ? normalizeResources(r.value) : []));
            const seen = new Set();
            resourcesData = merged.filter((r) => {
              const key = r?.id ?? `${r?.fileUrl ?? ''}-${r?.fileName ?? ''}-${r?.title ?? ''}`;
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
        }

        setResources(normalizeResources(resourcesData));
      } catch (err) {
        console.error('Failed to fetch parent resources:', err);
        setResources([]);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [grades, selectedGrade, selectedSubject]);

  useEffect(() => {
    let result = [...resources];

    // Parents should only see resources linked to Grade + Subject.
    // Also enforce school scoping when backend includes schoolId on resource objects.
    const parentInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const parentSchoolId = parentInfo?.schoolId;

    result = result.filter((r) => {
      if (parentSchoolId && r?.schoolId && String(r.schoolId) !== String(parentSchoolId)) {
        return false;
      }

      const visibilityRaw = r?.visibilityType;
      if (visibilityRaw === null || visibilityRaw === undefined || `${visibilityRaw}`.trim() === '') {
        return true;
      }

      const visibility = visibilityRaw.toString().toUpperCase();
      return visibility === 'GRADE_SUBJECT';
    });

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const title = (r.title || r.fileName || r.name || '').toLowerCase();
        const description = (r.description || '').toLowerCase();
        return title.includes(q) || description.includes(q);
      });
    }

    if (selectedSubject !== 'all') {
      result = result.filter((r) => {
        const ids = Array.isArray(r.subjectIds)
          ? r.subjectIds
          : r.subjectId !== null && r.subjectId !== undefined
          ? [r.subjectId]
          : [];
        return ids.some((sid) => String(sid) === String(selectedSubject));
      });
    }

    if (selectedGrade !== 'all') {
      result = result.filter((r) => {
        const ids = Array.isArray(r.gradeIds)
          ? r.gradeIds
          : r.gradeId !== null && r.gradeId !== undefined
          ? [r.gradeId]
          : [];
        return ids.some((gid) => String(gid) === String(selectedGrade));
      });
    }

    setFilteredResources(result);
  }, [resources, searchTerm, selectedSubject, selectedGrade]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSelectedGrade('all');
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      await downloadResource(fileUrl, fileName);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the resource.');
    }
  };

  const availableSubjects = [
    { id: 'all', name: 'All Subjects' },
    ...subjects.map((s) => ({ id: String(s.id), name: s.name })),
  ];

  const availableGrades = [
    { id: 'all', name: 'All Grades' },
    ...grades.map((g) => ({ id: String(g.id), name: g.name })),
  ];

  const getUploadDateLabel = (resource) => {
    const rawDate = resource?.uploadDate || resource?.uploadedAt || resource?.createdAt;
    if (!rawDate) return null;
    const label = formatDisplayDate(rawDate);
    return label || null;
  };

  const getFileName = (resource) => resource?.fileName || resource?.name || resource?.title || 'resource';

  const getFileTypeLabel = (resource) => {
    const fileName = getFileName(resource);
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Word';
    if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
    if (['txt'].includes(ext)) return 'Text';
    return 'File';
  };

  const visibilityLabel = (resource) => {
    const v = (resource?.visibilityType || '').toString().toUpperCase();
    if (v === 'PUBLIC') return 'Public';
    if (v === 'GRADE_SUBJECT') return 'Grade + Subject';
    return '';
  };

  const subjectLabel = useMemo(() => {
    const map = new Map(subjects.map((s) => [String(s.id), s.name]));
    return (id) => map.get(String(id)) || `Subject ${id}`;
  }, [subjects]);

  const gradeLabel = useMemo(() => {
    const map = new Map(grades.map((g) => [String(g.id), g.name]));
    return (id) => map.get(String(id)) || `Grade ${id}`;
  }, [grades]);

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
      <Typography variant="body1" sx={{ mb: 2 }}>
        View and download learning resources.
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
            <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} label="Subject">
              {availableSubjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel>Grade</InputLabel>
            <Select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} label="Grade">
              {availableGrades.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredResources.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FindInPageIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {resources.length === 0 ? 'No resources available yet.' : 'No resources match your filters.'}
          </Typography>
          {resources.length > 0 && (searchTerm || selectedSubject !== 'all' || selectedGrade !== 'all') && (
            <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 1 }}>
              Clear filters
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {filteredResources.map((resource) => {
            const title = resource.title || resource.fileName || resource.name || 'Untitled';
            const fileUrl = resource.fileUrl;
            const fileName = getFileName(resource);
            const dateLabel = getUploadDateLabel(resource);
            const vLabel = visibilityLabel(resource);

            const subjectIds = Array.isArray(resource.subjectIds)
              ? resource.subjectIds
              : resource.subjectId
              ? [resource.subjectId]
              : [];
            const gradeIds = Array.isArray(resource.gradeIds)
              ? resource.gradeIds
              : resource.gradeId
              ? [resource.gradeId]
              : [];

            return (
              <Card key={resource.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {title}
                  </Typography>
                  {resource.description ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {resource.description}
                    </Typography>
                  ) : null}

                  <Typography variant="caption" color="text.secondary" display="block">
                    Type: {getFileTypeLabel(resource)}
                  </Typography>
                  {dateLabel ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Uploaded: {dateLabel}
                    </Typography>
                  ) : null}

                  {vLabel ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Visibility: {vLabel}
                    </Typography>
                  ) : null}

                  {gradeIds.length ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Grades: {gradeIds.map((gid) => gradeLabel(gid)).join(', ')}
                    </Typography>
                  ) : null}

                  {subjectIds.length ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Subjects: {subjectIds.map((sid) => subjectLabel(sid)).join(', ')}
                    </Typography>
                  ) : null}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(fileUrl, fileName)}
                    disabled={!fileUrl}
                    sx={{ minHeight: 44 }}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ParentResources;
