// components/dashboard/admin/CalendarPanel.js
import React from 'react';
import { Paper, Typography } from '@mui/material';
// import { fetchCalendarEvents } from '../../../services/api';

const CalendarPanel = () => {
  // const [events, setEvents] = useState([]);

  // useEffect(() => {
  //   fetchCalendarEvents().then((res) => {
  //     setEvents(res.data || []);
  //   });
  // }, []);

  return (
    <Paper sx={{ p: 2, height: 380, overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Events
      </Typography>
      {/* {events.length > 0 ? (
        events.map((event, idx) => (
          <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
            {event.date} — {event.title}
          </Typography>
        ))
      ) : ( */}
        <Typography variant="body2" color="text.secondary">
          No events found.
        </Typography>
      {/* )} */}
    </Paper>
  );
};

export default CalendarPanel;
