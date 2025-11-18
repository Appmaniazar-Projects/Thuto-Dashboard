import api from './api';
import fileUploadService from './fileUploadService';

/**
 * Resource Management Service
 * Handles all resource-related API operations
 * Works alongside fileUploadService.js for Firebase Storage operations
 */

/**
 * Helper function to get current user ID from localStorage
 */
const getCurrentUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  if (!userInfo.id) {
    throw new Error('User ID not found. Please log in again.');
  }
  return userInfo.id;
};

/**
 * Helper function to get current school ID from localStorage
 */
const getCurrentSchoolId = () => {
  const schoolId = localStorage.getItem('schoolId');
  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }
  return schoolId;
};

// ==================== BACKEND API ENDPOINTS ====================

/**
 * Get resources for current user (uses Authentication from backend)
 * Backend automatically determines user from JWT token
 * Matches: GET /api/resources/my-resources
 * @param {Object} filters - Optional query parameters for filtering
 * @returns {Promise<Array>} List of resources for current user
 */
export const getMyResources = async () => {
  try {
    const response = await api.get('/resources/my-resources', {
      params: {
        userId: getCurrentUserId(), // Pass as query param if backend needs it
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my resources:', error);
    throw error;
  }
};


/**
 * Get all resources for a specific school
 * Matches: GET /api/resources/school/{schoolId}
 * @param {string|number} schoolId - School ID (optional, uses current school if not provided)
 * @returns {Promise<Array>} List of school resources
 */
export const getSchoolResources = async (schoolId = null) => {
  try {
    const targetSchoolId = schoolId || getCurrentSchoolId();
    const response = await api.get(`/resources/school/${targetSchoolId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch school resources:', error);
    throw error;
  }
};

/**
 * Upload a resource to the backend
 * Matches: POST /api/resources/upload
 * @param {Object} resourceData - Resource data to upload
 * @param {string} resourceData.title - Resource title
 * @param {string} resourceData.description - Resource description
 * @param {string} resourceData.fileUrl - URL to the file (from Firebase or other storage)
 * @param {string} resourceData.fileType - Type of file (pdf, docx, etc.)
 * @param {string} resourceData.category - Resource category
 * @param {string} [resourceData.subjectId] - Optional subject ID
 * @param {string} [resourceData.gradeId] - Optional grade ID
 * @returns {Promise<Object>} Created resource
 */
export const uploadResource = async (resourceData) => {
  try {
    const response = await api.post('/resources/upload', resourceData);
    return response.data;
  } catch (error) {
    console.error('Failed to upload resource:', error);
    throw error;
  }
};

// ==================== COMBINED OPERATIONS (Backend + Firebase) ====================

/**
 * Upload file to Firebase Storage and create resource record in backend
 * @param {File} file - File to upload
 * @param {Object} resourceMetadata - Resource metadata
 * @param {string} resourceMetadata.title - Resource title
 * @param {string} resourceMetadata.description - Resource description
 * @param {string} resourceMetadata.category - Resource category
 * @param {string} [resourceMetadata.subjectId] - Optional subject ID
 * @param {string} [resourceMetadata.gradeId] - Optional grade ID
 * @param {Function} [onProgress] - Upload progress callback
 * @returns {Promise<Object>} Complete resource with backend record
 */
export const uploadResourceWithFile = async (file, resourceMetadata, onProgress) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = getCurrentSchoolId();
    
    // Step 1: Upload file to Firebase Storage
    const firebaseMetadata = {
      schoolId,
      uploadedBy: userInfo.id || userInfo.phoneNumber,
      userRole: userInfo.role,
      fileType: 'resource',
      targetAudience: 'students', // or determine based on resourceMetadata
      gradeId: resourceMetadata.gradeId,
      subjectId: resourceMetadata.subjectId
    };
    
    const uploadResult = await fileUploadService.uploadFile(
      file, 
      firebaseMetadata, 
      onProgress
    );
    
    // Step 2: Create resource record in backend
    const backendResourceData = {
      title: resourceMetadata.title,
      description: resourceMetadata.description,
      fileUrl: uploadResult.downloadURL,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: resourceMetadata.category,
      subjectId: resourceMetadata.subjectId,
      gradeId: resourceMetadata.gradeId
    };
    
    const backendResource = await uploadResource(backendResourceData);
    
    return {
      ...backendResource,
      firebaseMetadata: uploadResult.metadata,
      downloadURL: uploadResult.downloadURL
    };
  } catch (error) {
    console.error('Failed to upload resource with file:', error);
    throw error;
  }
};

/**
 * Get resources from both backend and Firebase Storage
 * Combines data from both sources for comprehensive resource listing
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Combined resources from backend and Firebase
 */
export const getAllAvailableResources = async (filters = {}) => {
  try {
    // Get resources from backend
    const backendResources = await getMyResources(filters);
    
    // Get resources from Firebase Storage (for backward compatibility)
    const schoolId = getCurrentSchoolId();
    
    const firebaseCriteria = {
      schoolId,
      fileType: 'resource',
      targetAudience: 'students',
      ...filters
    };
    
    const firebaseResources = await fileUploadService.getFiles(firebaseCriteria);
    
    return {
      backend: backendResources,
      firebase: firebaseResources,
      combined: [...backendResources, ...firebaseResources]
    };
  } catch (error) {
    console.error('Failed to get all available resources:', error);
    throw error;
  }
};

/**
 * Download resource file
 * @param {string} fileUrl - URL to the file
 * @param {string} filename - Filename for download
 */
export const downloadResource = async (fileUrl, filename) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    
    // Create download link
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
    console.error('Failed to download resource:', error);
    throw error;
  }
};

// ==================== EXPORTS ====================

const resourceService = {
  // Backend API operations
  getMyResources,
  getSchoolResources,
  uploadResource,
  
  // Combined operations (Backend + Firebase)
  uploadResourceWithFile,
  getAllAvailableResources,
  
  // Utility operations
  downloadResource
};

export default resourceService;