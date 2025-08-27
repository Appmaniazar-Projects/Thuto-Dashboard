import api from './api';

/**
 * Student Profile
 */

export const getMyProfile = async () => {
  try {
    const response = await api.get('/student/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/student/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};

/**
 * Academic Reports
 */

export const getMyReports = async () => {
  try {
    const response = await api.get('/student/reports');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student reports:', error);
    throw error;
  }
};

export const downloadReport = async (reportId, filename) => {
  try {
    const response = await api.get(`/student/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `report-${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Attendance
 */

export const getMyAttendance = async (params = {}) => {
  try {
    const response = await api.get('/student/attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    throw error;
  }
};

export const getAttendanceStats = async () => {
  try {
    const response = await api.get('/student/attendance/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance stats:', error);
    throw error;
  }
};

/**
 * Resources
 */

export const getAvailableResources = async (filters = {}) => {
  try {
    const response = await api.get('/student/resources', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw error;
  }
};

export const downloadResource = async (resourceId, filename) => {
  try {
    const response = await api.get(`/student/resources/${resourceId}/download`, {
      responseType: 'blob',
    });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `resource-${resourceId}`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading resource ${resourceId}:`, error);
    throw error;
  }
};

/**
 * Schedule & Timetable
 */

export const getMySchedule = async (params = {}) => {
  try {
    const response = await api.get('/student/schedule', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    throw error;
  }
};

export const getTimetable = async (weekStart) => {
  try {
    const params = weekStart ? { weekStart } : {};
    const response = await api.get('/student/timetable', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch timetable:', error);
    throw error;
  }
};

/**
 * Grades & Assignments
 */

export const getMyGrades = async () => {
  try {
    const response = await api.get('/student/grades');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    throw error;
  }
};

export const getAssignments = async (params = {}) => {
  try {
    const response = await api.get('/student/assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    throw error;
  }
};

export const submitAssignment = async (assignmentId, submissionData) => {
  try {
    const formData = new FormData();
    
    // Append file if provided
    if (submissionData.file) {
      formData.append('file', submissionData.file);
    }
    
    // Append other submission data
    if (submissionData.text) {
      formData.append('text', submissionData.text);
    }
    
    const response = await api.post(
      `/student/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Failed to submit assignment ${assignmentId}:`, error);
    throw error;
  }
};

// Export all functions as default object
const studentService = {
  // Profile
  getMyProfile,
  updateProfile,
  
  // Reports
  getMyReports,
  downloadReport,
  
  // Attendance
  getMyAttendance,
  getAttendanceStats,
  
  // Resources
  getAvailableResources,
  downloadResource,
  
  // Schedule
  getMySchedule,
  getTimetable,
  
  // Grades & Assignments
  getMyGrades,
  getAssignments,
  submitAssignment,
};

export default studentService;
