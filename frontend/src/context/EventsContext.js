import React, { createContext, useContext, useState } from 'react';

const EventsContext = createContext();

const initialEvents = [
  {
    id: 1,
    createdAt: '2025-06-20T09:15:00Z',
    action: 'Updated attendance for Grade 8',
    createdBy: { name: 'Sarah', surname: 'Johnson', title: 'Ms.', role: 'teacher' }
  },
  {
    id: 2,
    createdAt: '2025-06-20T08:42:00Z',
    action: 'Approved field trip request',
    createdBy: { name: 'David', surname: 'Davis', title: 'Principal', role: 'admin' }
  },
];

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState(initialEvents);

  const addEvent = (event) => {
    setEvents(prev => [
      {
        ...event,
        id: prev.length + 1,
        createdAt: new Date().toISOString(),
      },
      ...prev
    ]);
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);