import React, { createContext, useContext, useState } from 'react';

const EventsContext = createContext();

const initialEvents = [
  {
    id: 1,
    createdAt: new Date().toISOString(),
    action: 'Events feature is coming soon!',
    createdBy: { name: 'System', role: 'system' }
  }
];

export const EventsProvider = ({ children }) => {
  const [events] = useState(initialEvents);

  const addEvent = () => {
    // No-op for now as the feature is coming soon
    return { success: true, message: 'This feature is coming soon!' };
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

export default EventsContext;