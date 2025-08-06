import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const mockFeed = [
  { id: 1, message: 'Science Fair on July 20th!', author: 'Admin', date: '2025-07-10' },
  { id: 2, message: 'Submit your math assignments by Friday.', author: 'Ms. Smith', date: '2025-07-09' },
  { id: 3, message: 'School closed next Monday for holiday.', author: 'Admin', date: '2025-07-08' },
];

const TeacherFeed = () => (
  <Card sx={{ p: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Feed / Announcements</Typography>
      <List>
        {mockFeed.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={item.message}
                secondary={`By: ${item.author} | ${item.date}`}
              />
            </ListItem>
            {idx < mockFeed.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default TeacherFeed; 