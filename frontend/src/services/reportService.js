import api from './api';
import fileUploadService from './fileUploadService';

/**
 * Upload an individual student's academic report (teacher/admin view)
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
  formData.append('gradeId', reportData.gradeId);
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
  export const getSubjectGradeReports = async (subjectId, gradeId, academicTerm = '') => {
    const params = { subjectId, gradeId };
    if (academicTerm) params.term = academicTerm;
    const response = await api.get('/reports/subject-grade', { params });
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

export const deleteReport = async (reportId, reportData = {}) => {
  // If it's a Firebase report (has filePath)
  if (reportData.filePath) {
    try {
      // Delete from Firebase Storage
      await fileUploadService.deleteFile(reportData.filePath);
      // If there's a backend record, delete that too
      if (!reportId.startsWith('firebase_')) {
        await api.delete(`/reports/${reportId}`);
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
  
  // Standard API deletion for non-Firebase reports
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};

export const downloadReport = async (reportId, fileName, reportData = {}) => {
  // If it's a Firebase report (has fileUrl)
  if (reportData.fileUrl) {
    try {
      // For Firebase, we can either:
      // 1. Return the direct URL for the browser to handle
      if (reportData.fileUrl.startsWith('http')) {
        const link = document.createElement('a');
        link.href = reportData.fileUrl;
        link.target = '_blank';
        link.download = fileName || `report-${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      // OR 2. Download via the backend if we need authentication
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
  
  // Standard API download for non-Firebase reports
  const response = await api.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  });
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
 * @returns {Promise<Array>} List of student's reports
 */
export const getMyReports = async () => {
  try {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userInfo.id;
    const schoolId = userInfo.schoolId;
    
    if (!userId || !schoolId) {
      throw new Error('User not properly authenticated');
    }

    // Get reports from the backend API
    const apiResponse = await api.get('/reports/my-reports', {
      params: { userId }
    });

    // Get reports from Firebase
    let firebaseReports = [];
    try {
      // Use the getFiles method with proper criteria
      firebaseReports = await fileUploadService.getFiles({
        schoolId,
        fileType: 'reports',  // or 'report' depending on your storage structure
        targetAudience: 'students,teachers,parents'  // Adjust based on your access control
      });
    } catch (fbError) {
      console.warn('Could not fetch reports from Firebase:', fbError);
      // Continue with just the API response if Firebase fails
      return apiResponse.data || [];
    }

    // Format Firebase reports to match the API response structure
    const formattedFirebaseReports = firebaseReports
      .filter(report => 
        // Filter for reports that belong to this user
        report.uploadedBy === userId || 
        report.metadata?.studentId === userId
      )
      .map(report => ({
        id: report.name || `firebase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: report.metadata?.studentId || userId,
        reportType: report.metadata?.reportType || 'Report',
        fileName: report.name,
        fileUrl: report.downloadURL,
        uploadDate: report.uploadDate || new Date().toISOString(),
        metadata: {
          ...(report.metadata || {}),
          source: 'firebase'
        }
      }));

    // Combine and deduplicate reports
    const apiReports = Array.isArray(apiResponse.data) ? apiResponse.data : [];
    const combined = [...apiReports];
    
    // Add Firebase reports that don't exist in the API response
    formattedFirebaseReports.forEach(fbReport => {
      const exists = combined.some(apiReport => 
        apiReport.fileUrl === fbReport.fileUrl || 
        (apiReport.fileName === fbReport.fileName && apiReport.uploadDate === fbReport.uploadDate)
      );
      if (!exists) {
        combined.push(fbReport);
      }
    });

    // Sort by upload date (newest first)
    return combined.sort((a, b) => 
      new Date(b.uploadDate) - new Date(a.uploadDate)
    );
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

// Update the uploadTeacherStudentReport function
export const uploadTeacherStudentReport = async (studentId, file, reportType) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = userInfo.schoolId;
    const teacherId = userInfo.id;
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    // Upload file to Firebase Storage
    const uploadMetadata = {
      schoolId,
      uploadedBy: userInfo.id || userInfo.email,
      userRole: 'teacher',
      fileType: 'report',
      targetAudience: 'teachers,parents', // Reports are typically for teachers and parents
      reportType,
      studentId // Include student ID in metadata for better organization
    };

    // Upload the file to Firebase
    const uploadResult = await fileUploadService.uploadFile(file, uploadMetadata);

    // Send report data to backend
    const reportData = {
      studentId,
      reportType,
      teacherId, 
      schoolId,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.downloadURL,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.fileType,
      uploadDate: new Date().toISOString()
    };

    const response = await api.post('/reports/teacher/upload', reportData);
    
    return {
      ...response.data,
      firebaseData: uploadResult
    };
  } catch (error) {
    console.error('Failed to upload report:', error);
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
    const response = await api.get(`/parent/children/${childId}/reports`);
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
    const response = await api.get(`/parent/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to download report ${reportId}:`, error);
    throw error;
  }
};
