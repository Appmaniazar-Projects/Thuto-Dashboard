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
 * Get reports for a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} List of student's reports
 */
export const getStudentReports = async (studentId) => {
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
