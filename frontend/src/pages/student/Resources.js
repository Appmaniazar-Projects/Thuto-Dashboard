import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Link,
  FormControl,
  InputLabel,
} from '@mui/material';

// Sample resource data with subjects and URLs (update with your actual URLs)
const resourcesData = [
  { id: 1, title: 'Math Worksheet 1', subject: 'Mathematics', url: '/downloads/math-worksheet-1.pdf' },
  { id: 2, title: 'Science Project Guide', subject: 'Science', url: '/downloads/science-project-guide.pdf' },
  { id: 3, title: 'English Literature Notes', subject: 'English', url: '/downloads/english-notes.pdf' },
  { id: 4, title: 'Math Worksheet 2', subject: 'Mathematics', url: '/downloads/math-worksheet-2.pdf' },
  { id: 5, title: 'History Timeline', subject: 'History', url: '/downloads/history-timeline.pdf' },
];

const Resources = () => {
  const [selectedSubject, setSelectedSubject] = useState('');

  // Extract unique subjects for filter dropdown
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(resourcesData.map((r) => r.subject));
    return Array.from(uniqueSubjects);
  }, []);

  // Filter resources by selected subject
  const filteredResources = selectedSubject
    ? resourcesData.filter((r) => r.subject === selectedSubject)
    : resourcesData;

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Student Resources
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="subject-filter-label">Filter by Subject</InputLabel>
        <Select
          labelId="subject-filter-label"
          value={selectedSubject}
          label="Filter by Subject"
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <MenuItem value="">All Subjects</MenuItem>
          {subjects.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <List>
        {filteredResources.length === 0 ? (
          <Typography variant="body1">No resources found for the selected subject.</Typography>
        ) : (
          filteredResources.map(({ id, title, url, subject }) => (
            <ListItem key={id} divider>
              <ListItemText
                primary={
                  <Link href={url} target="_blank" rel="noopener noreferrer" download>
                    {title}
                  </Link>
                }
                secondary={subject}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default Resources;
