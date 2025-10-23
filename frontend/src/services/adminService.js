import api from './api';
import fileUploadService from './fileUploadService';

/**
 * Fetches all users for the admin
 * @returns {Promise<Array>} Array of user objects
 * /admins/allRoleSpecificUsers/all'
 */
export const getAllUsers = async () => {
  try {
    // Get admin info for context
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
    
    console.log('Fetching all users from /admin/users with context:', {
      adminEmail: adminInfo.email,
      schoolId: schoolId,
      adminInfo: adminInfo
    });
    
    // Add admin context as query parameters
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (adminInfo.email) params.adminEmail = adminInfo.email;
    
    const response = await api.get('/admin/users', { params });
    
    // Handle different response structures
    const users = response.data || [];
    console.log('Received users response:', { 
      status: response.status, 
      dataType: typeof users, 
      isArray: Array.isArray(users),
      length: Array.isArray(users) ? users.length : 'N/A',
      users: users
    });
    
    // Ensure we always return an array
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    
    // If it's a 404 or the endpoint doesn't exist, return empty array
    if (error.response?.status === 404) {
      console.log('No users found (404), returning empty array');
      return [];
    }
    
    throw error;
  }
};

/**
 * Fetches users by role
 * @param {string} role - User role to filter by
 * @returns {Promise<Array>} Array of user objects with specified role
 * /admins/allRoleSpecificUsers/all'
 */
export const getUsersByRole = async (role) => {
  try {
    // Get admin info for context
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
    
    // Add admin context as query parameters
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (adminInfo.email) params.adminEmail = adminInfo.email;
    
    const response = await api.get(`/admin/users/role/${role}`, { params });
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch users with role ${role}:`, error);
    
    // Return empty array for 404s
    if (error.response?.status === 404) {
      return [];
    }
    
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
    // Get admin info from localStorage
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
    
    console.log('Admin context check:', {
      adminInfo,
      schoolIdFromStorage: localStorage.getItem('schoolId'),
      schoolIdFromAdmin: adminInfo.schoolId,
      finalSchoolId: schoolId
    });
    
    // Validate required data
    if (!schoolId && !adminInfo.email) {
      throw new Error('Missing school context. Admin must be properly logged in.');
    }
    
    // Clean and validate user data
    const cleanedUserData = {
      ...userData,
      // Ensure grade is an array (support multiple grades)
      grade: Array.isArray(userData.grade) ? userData.grade : (userData.grade ? [userData.grade] : []),
      // Ensure subjects is an array
      subjects: Array.isArray(userData.subjects) ? userData.subjects : [],
      // Remove empty fields
      name: userData.name?.trim() || '',
      lastName: userData.lastName?.trim() || '',
      email: userData.email?.trim() || '',
      phoneNumber: userData.phoneNumber?.trim() || ''
    };
    
    // Prepare payload with admin context
    const payload = {
      ...cleanedUserData,
      schoolId: schoolId || 'MISSING_SCHOOL_ID',
      createdBy: adminInfo.email || adminInfo.id || 'MISSING_ADMIN_EMAIL',
      createdByRole: 'admin',
      adminEmail: adminInfo.email // Add admin email as separate field
    };
    
    console.log('Creating user with payload:', payload);
    const response = await api.post('/admin/createUser', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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
    // Get the logged-in user's email for updatedBy
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedBy = currentUser.email || 'unknown';
    
    const response = await api.put(`/admin/users/${userId}`, {
      ...userData,
      updatedBy: updatedBy
    });
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
