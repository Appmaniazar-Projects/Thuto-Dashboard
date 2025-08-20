import api from './api';

/**
 * Fetches all announcements for the school.
 * The schoolId is automatically added by the api interceptor.
 */
export const getAnnouncements = async () => {
  try {
    const response = await api.get('/announcements');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    throw error;
  }
};

/**
 * Creates a new announcement.
 * The schoolId is automatically added by the api interceptor.
 * @param {object} announcementData - The announcement data (e.g., { title, content }).
 */
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Failed to create announcement:', error);
    throw error;
  }
};
