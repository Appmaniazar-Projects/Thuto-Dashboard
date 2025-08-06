import axios from 'axios';

const API_URL = '/api/calendar';

// Get all events for a specific date range
export const getEvents = async (startDate, endDate) => {
  try {
    const response = await axios.get(API_URL, {
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
    const response = await axios.post(API_URL, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await axios.delete(`${API_URL}/${eventId}`);
    return eventId; // Return the deleted event ID for state updates
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event types (if they're dynamic)
export const getEventTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/event-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return []; // Return default event types if API fails
  }
};
