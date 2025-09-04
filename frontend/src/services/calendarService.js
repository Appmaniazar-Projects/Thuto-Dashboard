import api from './api';

const API_BASE = '/calendar';

// Get all events for a specific date range
export const getEvents = async (startDate, endDate) => {
  try {
    const response = await api.get(API_BASE, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post(API_BASE, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`${API_BASE}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`${API_BASE}/${eventId}`);
    return eventId; // Return the deleted event ID for state updates
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event types (if they're dynamic)
export const getEventTypes = async () => {
  try {
    const response = await api.get(`${API_BASE}/event-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return []; // Return default event types if API fails
  }
};
