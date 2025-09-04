import api from './api';

/**
 * Upload an individual student's academic report
 * @param {Object} reportData - Report data including file and metadata
 * @param {File} reportData.file - The report file (PDF/DOCX)
 * @param {string} reportData.studentId - Student ID
 * @param {string} reportData.academicTerm - e.g., "Term 1 2024"
 * @param {string} reportData.grade - Student's grade/class
 * @param {string} reportData.comments - Teacher's comments
 * @param {Object} reportData.grades - Subject grades {subject: string, grade: string, comments: string}[]
 * @param {string} reportData.overallPerformance - Overall performance rating
 * @returns {Promise<Object>} Uploaded report data
 */
export const uploadStudentReport = async (reportData) => {
  const formData = new FormData();
  
  // Append file if provided
  if (reportData.file) {
    formData.append('file', reportData.file);
  }
  
  // Append report metadata
  formData.append('studentId', reportData.studentId);
  formData.append('academicTerm', reportData.academicTerm);
  formData.append('grade', reportData.grade);
  formData.append('comments', reportData.comments || '');
  formData.append('overallPerformance', reportData.overallPerformance);
  
  // Stringify grades array
  if (reportData.grades && Array.isArray(reportData.grades)) {
    formData.append('grades', JSON.stringify(reportData.grades));
  }

  const response = await api.post('/reports/student/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get reports for a specific student (teacher/admin view)
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} List of student's reports
 */
export const getStudentReportsByTeacher = async (studentId) => {
  const response = await api.get(`/reports/student/${studentId}`);
  return response.data;
};

/**
 * Get reports for multiple students in a class
 * @param {string} classId - Class ID
 * @param {string} [academicTerm] - Optional term filter
 * @returns {Promise<Array>} List of reports for the class
 */
export const getClassReports = async (classId, academicTerm = '') => {
  const params = {};
  if (academicTerm) {
    params.term = academicTerm;
  }
  const response = await api.get(`/reports/class/${classId}`, { params });
  return response.data;
};

/**
 * Get a single report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Report details
 */
export const getReport = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

/**
 * Update a student's report
 * @param {string} reportId - Report ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated report
 */
export const updateReport = async (reportId, updates) => {
  const response = await api.put(`/reports/${reportId}`, updates);
  return response.data;
};

/**
 * Delete a report
 * @param {string} reportId - Report ID to delete
 * @returns {Promise<Object>} Deletion status
 */
export const deleteReport = async (reportId) => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};

/**
 * Download a report file
 * @param {string} reportId - Report ID to download
 * @returns {Promise<Blob>} File blob
 */
export const downloadReport = async (reportId) => {
  const response = await api.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get report statistics for a class
 * @param {string} classId - Class ID
 * @param {string} [academicTerm] - Optional term filter
 * @returns {Promise<Object>} Statistics including averages, distribution, etc.
 */
export const getClassReportStats = async (classId, academicTerm = '') => {
  const params = academicTerm ? { term: academicTerm } : {};
  const response = await api.get(`/reports/class/${classId}/stats`, { params });
  return response.data;
};

/**
 * Get academic terms with reports
 * @returns {Promise<Array>} List of academic terms
 */
export const getAcademicTerms = async () => {
  const response = await api.get('/reports/terms');
  return response.data;
};

const REPORT_ENDPOINTS = {
  ATTENDANCE: '/reports/attendance',
  ACADEMIC: '/reports/academic',
  BEHAVIOR: '/reports/behavior',
  ENROLLMENT: '/reports/enrollment',
  CUSTOM: '/reports/custom',
};

/**
 * Generate a report
 * @param {string} reportType - Type of report
 * @param {Object} filters - Filters for the report
 * @returns {Promise<Object>} Report data
 */
export const generateReport = async (reportType, filters = {}) => {
  try {
    const endpoint = REPORT_ENDPOINTS[reportType.toUpperCase()] || REPORT_ENDPOINTS.ATTENDANCE;
    const response = await api.post(endpoint, filters);
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

/**
 * Download a report
 * @param {string} reportType - Type of report
 * @param {string} format - Format of the report (default: pdf)
 * @param {Object} filters - Filters for the report
 * @returns {Promise<boolean>} Whether the report was downloaded successfully
 */
export const downloadGeneratedReport = async (reportType, format = 'pdf', filters = {}) => {
  try {
    const endpoint = `${REPORT_ENDPOINTS[reportType.toUpperCase()] || REPORT_ENDPOINTS.ATTENDANCE}/download`;
    const response = await api.post(
      endpoint,
      { ...filters, format },
      { responseType: 'blob' } // Important for file download
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

/**
 * Get report filters
 * @returns {Promise<Object>} Report filters
 */
export const getReportFilters = async () => {
  try {
    const response = await api.get('/reports/filters');
    return response.data;
  } catch (error) {
    console.error('Error fetching report filters:', error);
    throw error;
  }
};

// ========== ROLE-SPECIFIC REPORT FUNCTIONS ==========

/**
 * Get student's own reports (student view)
 * @param {Object} params - Query parameters (optional filters)
 * @returns {Promise<Array>} List of student's reports
 */
export const getMyReports = async (params = {}) => {
  try {
    const response = await api.get('/student/reports', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student reports:', error);
    throw error;
  }
};

/**
 * Download student report
 * @param {string} reportId - Report ID to download
 * @param {string} filename - Optional filename for download
 * @returns {Promise<void>} Initiates file download
 */
export const downloadStudentReport = async (reportId, filename) => {
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
    console.error(`Error downloading student report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get reports for a specific student (teacher view)
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} List of student's reports
 */
export const getTeacherStudentReports = async (studentId) => {
  try {
    const response = await api.get(`/teacher/students/${studentId}/reports`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reports for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Upload report for a student (teacher function)
 * @param {string} studentId - Student ID
 * @param {File} file - Report file
 * @param {string} description - Report description
 * @returns {Promise<Object>} Upload response
 */
export const uploadTeacherStudentReport = async (studentId, file, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);

  try {
    const response = await api.post(`/teacher/students/${studentId}/reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to upload report for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Get child's reports (parent view)
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} List of child's reports
 */
export const getParentChildReports = async (childId) => {
  try {
    const response = await api.get(`/api/parent/children/${childId}/reports`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reports for child ${childId}:`, error);
    throw error;
  }
};

/**
 * Download report (parent function)
 * @param {string} reportId - Report ID
 * @returns {Promise<Blob>} Report file blob
 */
export const downloadParentReport = async (reportId) => {
  try {
    const response = await api.get(`/api/parent/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to download report ${reportId}:`, error);
    throw error;
  }
};
