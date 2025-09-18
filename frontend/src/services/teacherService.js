import api from './api';

/**
 * Fetches the students assigned to the logged-in teacher.
 */
export const getMyStudents = async () => {
  try {
    const response = await api.get('/teacher/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};

/**
 * Get all resources uploaded by the teacher
 */
export const getTeacherResources = async () => {
  try {
    const response = await api.get('/teacher/resources');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher resources:', error);
    throw error;
  }
};

/**
 * Upload a new resource
 * @param {Object} resourceData - The resource data including file and metadata
 * @param {File} resourceData.file - The file to upload
 * @param {string} resourceData.classId - The ID of the class this resource is for
 * @param {string} resourceData.description - Optional description of the resource
 */
export const uploadResource = async ({ file, classId, description = '' }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('classId', classId);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await api.post('/teacher/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload resource:', error);
    throw error;
  }
};

/**
 * Delete a resource
 * @param {string} resourceId - The ID of the resource to delete
 */
export const deleteResource = async (resourceId) => {
  try {
    await api.delete(`/teacher/resources/${resourceId}`);
  } catch (error) {
    console.error('Failed to delete resource:', error);
    throw error;
  }
};

/**
 * Get classes taught by the teacher
 */
export const getTeacherClasses = async () => {
  try {
    const response = await api.get('/teacher/classes');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher classes:', error);
    throw error;
  }
};

/**
 * Get all students in teacher's classes
 */
export const getTeacherStudents = async () => {
  try {
    const response = await api.get('/teacher/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher students:', error);
    throw error;
  }
};

/**
 * Get recent resources uploaded by the teacher
 */
export const getRecentResources = async (limit = 5) => {
  try {
    const response = await api.get(`/teacher/resources/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent resources:', error);
    throw error;
  }
};

const teacherService = {
  getMyStudents,
  getTeacherResources,
  uploadResource,
  deleteResource,
  getTeacherClasses,
  getTeacherStudents,
  getRecentResources
};

export {
  getMyStudents,
  getTeacherResources,
  uploadResource,
  deleteResource,
  getTeacherClasses,
  getTeacherStudents,
  getRecentResources
};

export default teacherService;
