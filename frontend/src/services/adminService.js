import api from './api';
import fileUploadService from './fileUploadService';

/**
 * Fetches all users for the admin
 * @returns {Promise<Array>} Array of user objects
 * /admins/allRoleSpecificUsers/all'
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admins/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Fetches users by role
 * @param {string} role - User role to filter by
 * @returns {Promise<Array>} Array of user objects with specified role
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/admins/allRoleSpecificUsers/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch users with role ${role}:`, error);
    throw error;
  }
};

/**
 * Creates a new user with the specified role
 * @param {object} userData - User information including role
 * @returns {Promise<object>} Created user object
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/createUser', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
};

/**
 * Updates an existing user
 * @param {string} userId - User ID to update
 * @param {object} userData - Updated user information
 * @returns {Promise<object>} Updated user object
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

/**
 * Deletes a user
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    await api.delete(`/admin/removeUser/${userId}`);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

/**
 * Upload school document with Firebase Storage integration
 * @param {Object} documentData - Document data
 * @param {File} documentData.file - Document file
 * @param {string} documentData.title - Document title
 * @param {string} documentData.description - Document description
 * @param {string} documentData.category - Document category (policy/form/announcement/etc)
 * @param {string} documentData.targetAudience - Target audience (students/parents/teachers/all)
 * @param {Function} onProgress - Progress callback
 */
export const uploadSchoolDocument = async ({
  file,
  title,
  description = '',
  category = 'general',
  targetAudience = 'all'
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
      uploadedBy: userInfo.id || userInfo.email,
      userRole: 'admin',
      fileType: 'document',
      targetAudience,
      category
    };

    const uploadResult = await fileUploadService.uploadFile(file, uploadMetadata, onProgress);

    // Send document data to backend
    const documentPayload = {
      title,
      description,
      category,
      targetAudience,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.downloadURL,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.fileType,
      uploadDate: uploadResult.uploadDate
    };

    const response = await api.post('/admin/documents/upload', documentPayload);
    
    return {
      ...response.data,
      firebaseData: uploadResult
    };
  } catch (error) {
    console.error('Failed to upload school document:', error);
    throw error;
  }
};

/**
 * Create announcement with optional file attachments
 * @param {Object} announcementData - Announcement data
 * @param {string} announcementData.title - Announcement title
 * @param {string} announcementData.content - Announcement content
 * @param {string} announcementData.targetAudience - Target audience
 * @param {Array} announcementData.attachments - Array of files to attach
 * @param {Function} onProgress - Progress callback for file uploads
 */
export const createAnnouncement = async ({
  title,
  content,
  targetAudience = 'all',
  attachments = []
}, onProgress = null) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    let attachmentUrls = [];

    // Upload attachments if any
    if (attachments.length > 0) {
      const uploadMetadata = {
        schoolId,
        uploadedBy: userInfo.id || userInfo.email,
        userRole: 'admin',
        fileType: 'announcement-attachment',
        targetAudience
      };

      const uploadPromises = attachments.map(async (file, index) => {
        const fileProgress = onProgress ? (progress, state) => {
          onProgress(index, progress, state, file.name);
        } : null;

        return fileUploadService.uploadFile(file, uploadMetadata, fileProgress);
      });

      const uploadResults = await Promise.all(uploadPromises);
      attachmentUrls = uploadResults.map(result => ({
        fileName: result.fileName,
        fileUrl: result.downloadURL,
        filePath: result.filePath,
        fileSize: result.fileSize
      }));
    }

    // Create announcement with attachment URLs
    const announcementPayload = {
      title,
      content,
      targetAudience,
      attachments: attachmentUrls
    };

    const response = await api.post('/admin/announcements', announcementPayload);
    return response.data;
  } catch (error) {
    console.error('Failed to create announcement:', error);
    throw error;
  }
};

/**
 * Get school documents
 * @param {Object} filters - Filter criteria
 */
export const getSchoolDocuments = async (filters = {}) => {
  try {
    const response = await api.get('/admin/documents', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch school documents:', error);
    throw error;
  }
};

/**
 * Delete school document (removes from both backend and Firebase Storage)
 * @param {string} documentId - Document ID to delete
 */
export const deleteSchoolDocument = async (documentId) => {
  try {
    // Get document details first to get Firebase path
    const response = await api.get(`/admin/documents/${documentId}`);
    const document = response.data;

    // Delete from Firebase Storage if filePath exists
    if (document.filePath) {
      try {
        await fileUploadService.deleteFile(document.filePath);
      } catch (firebaseError) {
        console.warn('Failed to delete from Firebase Storage:', firebaseError);
        // Continue with backend deletion even if Firebase deletion fails
      }
    }

    // Delete from backend
    await api.delete(`/admin/documents/${documentId}`);
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw error;
  }
};

/**
 * Get documents from Firebase Storage for current school
 * @param {Object} filters - Filter criteria
 */
export const getDocumentsFromStorage = async (filters = {}) => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'document',
      ...filters
    };

    return await fileUploadService.getFiles(criteria);
  } catch (error) {
    console.error('Failed to fetch documents from storage:', error);
    throw error;
  }
};

/**
 * Upload bulk student data (CSV/Excel files)
 * @param {File} file - CSV or Excel file
 * @param {string} dataType - Type of data (students/teachers/grades/etc)
 * @param {Function} onProgress - Progress callback
 */
export const uploadBulkData = async (file, dataType = 'students', onProgress = null) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    // Upload file to Firebase Storage
    const uploadMetadata = {
      schoolId,
      uploadedBy: userInfo.id || userInfo.email,
      userRole: 'admin',
      fileType: 'bulk-data',
      targetAudience: 'admin',
      dataType
    };

    const uploadResult = await fileUploadService.uploadFile(file, uploadMetadata, onProgress);

    // Send file URL to backend for processing
    const bulkDataPayload = {
      dataType,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.downloadURL,
      filePath: uploadResult.filePath,
      uploadDate: uploadResult.uploadDate
    };

    const response = await api.post('/admin/bulk-upload', bulkDataPayload);
    
    return {
      ...response.data,
      firebaseData: uploadResult
    };
  } catch (error) {
    console.error('Failed to upload bulk data:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  uploadSchoolDocument,
  createAnnouncement,
  getSchoolDocuments,
  deleteSchoolDocument,
  getDocumentsFromStorage,
  uploadBulkData
};
