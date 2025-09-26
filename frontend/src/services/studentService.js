import api from './api';
import fileUploadService from './fileUploadService';

/**
 * Student Profile - Updated to match backend API structure
 */

export const getMyProfile = async (phoneNumber) => {
  try {
    const response = await api.get(`/student/${phoneNumber}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

export const updateProfile = async (studentData) => {
  try {
    const response = await api.put('/student/updateStudent', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};

/**
 * Resources
 */

export const getAvailableResources = async (filters = {}) => {
  try {
    const response = await api.get('/resources/my-resources', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw error;
  }
};

/**
 * Get resources from Firebase Storage for current student
 * @param {Object} filters - Filter criteria
 */
export const getResourcesFromStorage = async (filters = {}) => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'resource',
      targetAudience: 'students',
      ...filters
    };

    // Get resources from Firebase Storage
    const storageResources = await fileUploadService.getFiles(criteria);
    
    // Also get resources that target 'all' users
    const allUsersCriteria = {
      ...criteria,
      targetAudience: 'all'
    };
    const allUsersResources = await fileUploadService.getFiles(allUsersCriteria);
    
    // Combine and deduplicate resources
    const allResources = [...storageResources, ...allUsersResources];
    const uniqueResources = allResources.filter((resource, index, self) => 
      index === self.findIndex(r => r.filePath === resource.filePath)
    );
    
    return uniqueResources;
  } catch (error) {
    console.error('Failed to fetch resources from storage:', error);
    throw error;
  }
};

/**
 * Download resource directly from Firebase Storage
 * @param {string} downloadURL - Firebase Storage download URL
 * @param {string} filename - File name for download
 */
export const downloadResourceFromStorage = async (downloadURL, filename) => {
  try {
    const response = await fetch(downloadURL);
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading resource from storage:', error);
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
 * Reports
 */

/**
 * Get student reports from backend
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

/**
 * Get student reports from Firebase Storage
 */
export const getReportsFromStorage = async () => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'report',
      targetAudience: 'parents', // Reports are typically for parents but students can view
      studentId: userInfo.id || userInfo.phoneNumber
    };

    return await fileUploadService.getFiles(criteria);
  } catch (error) {
    console.error('Failed to fetch reports from storage:', error);
    throw error;
  }
};

/**
 * Download report from Firebase Storage
 * @param {string} downloadURL - Firebase Storage download URL
 * @param {string} filename - File name for download
 */
export const downloadReportFromStorage = async (downloadURL, filename) => {
  try {
    const response = await fetch(downloadURL);
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report from storage:', error);
    throw error;
  }
};

/**
 * School Documents
 */

/**
 * Get school documents accessible to students
 */
export const getSchoolDocuments = async (filters = {}) => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'document',
      targetAudience: 'students',
      ...filters
    };

    // Get documents for students
    const studentDocs = await fileUploadService.getFiles(criteria);
    
    // Also get documents for all users
    const allUsersCriteria = {
      ...criteria,
      targetAudience: 'all'
    };
    const allUsersDocs = await fileUploadService.getFiles(allUsersCriteria);
    
    // Combine and deduplicate
    const allDocs = [...studentDocs, ...allUsersDocs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.filePath === doc.filePath)
    );
    
    return uniqueDocs;
  } catch (error) {
    console.error('Failed to fetch school documents:', error);
    throw error;
  }
};

// Export all functions as default object
const studentService = {
  // Profile
  getMyProfile,
  updateProfile,
  
  // Resources
  getAvailableResources,
  downloadResource,
  getResourcesFromStorage,
  downloadResourceFromStorage,
  
  // Reports
  getMyReports,
  getReportsFromStorage,
  downloadReportFromStorage,
  
  // Documents
  getSchoolDocuments
};

export default studentService;
