import api from './api';
import fileUploadService from './fileUploadService';

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
 * Upload a new resource with Firebase Storage integration
 * @param {Object} resourceData - The resource data including file and metadata
 * @param {File} resourceData.file - The file to upload
 * @param {string} resourceData.title - Title of the resource
 * @param {string} resourceData.description - Description of the resource
 * @param {string} resourceData.gradeId - Grade ID (optional)
 * @param {string} resourceData.subjectId - Subject ID (optional)
 * @param {string} resourceData.targetAudience - Target audience (students/parents/all)
 * @param {Function} onProgress - Progress callback function
 */
export const uploadResource = async ({ 
  file, 
  title, 
  description = '', 
  gradeId = '', 
  subjectId = '', 
  targetAudience = 'students' 
}, onProgress = null) => {
  try {
    // Get current user info from token or context
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    // Upload file to Firebase Storage
    const uploadMetadata = {
      schoolId,
      uploadedBy: userInfo.id || userInfo.phoneNumber,
      userRole: 'teacher',
      fileType: 'resource',
      targetAudience,
      gradeId,
      subjectId
    };

    const uploadResult = await fileUploadService.uploadFile(file, uploadMetadata, onProgress);

    // Send resource data with Firebase URL to backend
    const resourcePayload = {
      title,
      description,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.downloadURL,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.fileType,
      gradeId: gradeId || null,
      subjectId: subjectId || null,
      targetAudience,
      uploadDate: uploadResult.uploadDate
    };

    const response = await api.post('/teacher/resources/upload', resourcePayload);
    
    return {
      ...response.data,
      firebaseData: uploadResult
    };
  } catch (error) {
    console.error('Failed to upload resource:', error);
    throw error;
  }
};

/**
 * Upload multiple resources
 * @param {Array} resources - Array of resource objects
 * @param {Function} onProgress - Progress callback for each file
 */
export const uploadMultipleResources = async (resources, onProgress = null) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const uploadPromises = resources.map(async (resource, index) => {
      const { file, title, description = '', gradeId = '', subjectId = '', targetAudience = 'students' } = resource;
      
      const fileProgress = onProgress ? (progress, state) => {
        onProgress(index, progress, state, file.name);
      } : null;

      return uploadResource({
        file,
        title,
        description,
        gradeId,
        subjectId,
        targetAudience
      }, fileProgress);
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Failed to upload multiple resources:', error);
    throw error;
  }
};

/**
 * Delete a resource (removes from both backend and Firebase Storage)
 * @param {string} resourceId - The ID of the resource to delete
 */
export const deleteResource = async (resourceId) => {
  try {
    // Get resource details first to get Firebase path
    const response = await api.get(`/teacher/resources/${resourceId}`);
    const resource = response.data;

    // Delete from Firebase Storage if filePath exists
    if (resource.filePath) {
      try {
        await fileUploadService.deleteFile(resource.filePath);
      } catch (firebaseError) {
        console.warn('Failed to delete from Firebase Storage:', firebaseError);
        // Continue with backend deletion even if Firebase deletion fails
      }
    }

    // Delete from backend
    await api.delete(`/teacher/resources/${resourceId}`);
  } catch (error) {
    console.error('Failed to delete resource:', error);
    throw error;
  }
};

/**
 * Upload student report with Firebase Storage integration
 * @param {Object} reportData - Report data
 * @param {File} reportData.file - Report file
 * @param {string} reportData.studentId - Student ID
 * @param {string} reportData.title - Report title
 * @param {string} reportData.description - Report description
 * @param {string} reportData.reportType - Type of report (academic/behavioral/etc)
 * @param {Function} onProgress - Progress callback
 */
export const uploadStudentReport = async ({
  file,
  studentId,
  title,
  description = '',
  reportType = 'academic'
}, onProgress = null) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    // Upload file to Firebase Storage
    const uploadMetadata = {
      schoolId,
      uploadedBy: userInfo.id || userInfo.phoneNumber,
      userRole: 'teacher',
      fileType: 'report',
      targetAudience: 'parents',
      studentId
    };

    const uploadResult = await fileUploadService.uploadFile(file, uploadMetadata, onProgress);

    // Send report data to backend
    const reportPayload = {
      studentId,
      title,
      description,
      reportType,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.downloadURL,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      uploadDate: uploadResult.uploadDate
    };

    const response = await api.post('/teacher/students/reports/upload', reportPayload);
    
    return {
      ...response.data,
      firebaseData: uploadResult
    };
  } catch (error) {
    console.error('Failed to upload student report:', error);
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

/**
 * Get resources from Firebase Storage for current school
 * @param {Object} filters - Filter criteria
 */
export const getResourcesFromStorage = async (filters = {}) => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'resource',
      ...filters
    };

    return await fileUploadService.getFiles(criteria);
  } catch (error) {
    console.error('Failed to fetch resources from storage:', error);
    throw error;
  }
};

const teacherService = {
  getMyStudents,
  getTeacherResources,
  uploadResource,
  uploadMultipleResources,
  deleteResource,
  uploadStudentReport,
  getTeacherStudents,
  getRecentResources,
  getResourcesFromStorage
};

export default teacherService;
