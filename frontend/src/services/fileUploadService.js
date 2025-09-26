import { storage } from './firebase';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata 
} from 'firebase/storage';

/**
 * Firebase Storage Service for handling file uploads and management
 * Organizes files by school, user role, and file type
 */
class FileUploadService {
  
  /**
   * Upload a file to Firebase Storage
   * @param {File} file - The file to upload
   * @param {Object} metadata - Upload metadata
   * @param {string} metadata.schoolId - School ID
   * @param {string} metadata.uploadedBy - User ID who uploaded
   * @param {string} metadata.userRole - Role of uploader (teacher/admin)
   * @param {string} metadata.fileType - Type of file (document/image/report)
   * @param {string} metadata.targetAudience - Who can access (students/parents/teachers/all)
   * @param {string} [metadata.gradeId] - Optional grade ID for grade-specific files
   * @param {string} [metadata.subjectId] - Optional subject ID for subject-specific files
   * @param {Function} [onProgress] - Progress callback function
   * @returns {Promise<Object>} Upload result with download URL and metadata
   */
  async uploadFile(file, metadata, onProgress = null) {
    try {
      // Validate file
      this.validateFile(file);
      
      // Generate file path
      const filePath = this.generateFilePath(file, metadata);
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          schoolId: metadata.schoolId,
          uploadedBy: metadata.uploadedBy,
          userRole: metadata.userRole,
          fileType: metadata.fileType,
          targetAudience: metadata.targetAudience,
          gradeId: metadata.gradeId || '',
          subjectId: metadata.subjectId || '',
          originalName: file.name,
          uploadDate: new Date().toISOString()
        }
      });
      
      return new Promise((resolve, reject) => {
        // Monitor upload progress
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress, snapshot.state);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(this.handleUploadError(error));
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Get file metadata
              const fileMetadata = await getMetadata(uploadTask.snapshot.ref);
              
              const result = {
                downloadURL,
                filePath,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                metadata: fileMetadata.customMetadata,
                uploadDate: new Date().toISOString()
              };
              
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
    } catch (error) {
      throw this.handleUploadError(error);
    }
  }
  
  /**
   * Upload multiple files
   * @param {FileList|Array} files - Files to upload
   * @param {Object} metadata - Upload metadata
   * @param {Function} [onProgress] - Progress callback for each file
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(files, metadata, onProgress = null) {
    const uploadPromises = Array.from(files).map((file, index) => {
      const fileProgress = onProgress ? (progress, state) => {
        onProgress(index, progress, state, file.name);
      } : null;
      
      return this.uploadFile(file, metadata, fileProgress);
    });
    
    return Promise.all(uploadPromises);
  }
  
  /**
   * Delete a file from Firebase Storage
   * @param {string} filePath - Path to the file in storage
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file');
    }
  }
  
  /**
   * Get files for a specific school and criteria
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.schoolId - School ID
   * @param {string} [criteria.fileType] - File type filter
   * @param {string} [criteria.targetAudience] - Target audience filter
   * @param {string} [criteria.gradeId] - Grade ID filter
   * @param {string} [criteria.subjectId] - Subject ID filter
   * @returns {Promise<Array>} Array of file information
   */
  async getFiles(criteria) {
    try {
      const { schoolId, fileType, targetAudience, gradeId, subjectId } = criteria;
      
      // Build path based on criteria
      let basePath = `schools/${schoolId}`;
      if (fileType) basePath += `/${fileType}`;
      
      const listRef = ref(storage, basePath);
      const result = await listAll(listRef);
      
      // Get metadata for each file and filter
      const filePromises = result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          // Apply filters
          if (targetAudience && metadata.customMetadata?.targetAudience !== targetAudience) {
            return null;
          }
          if (gradeId && metadata.customMetadata?.gradeId !== gradeId) {
            return null;
          }
          if (subjectId && metadata.customMetadata?.subjectId !== subjectId) {
            return null;
          }
          
          return {
            name: metadata.customMetadata?.originalName || itemRef.name,
            downloadURL,
            filePath: itemRef.fullPath,
            size: metadata.size,
            contentType: metadata.contentType,
            uploadDate: metadata.customMetadata?.uploadDate,
            uploadedBy: metadata.customMetadata?.uploadedBy,
            userRole: metadata.customMetadata?.userRole,
            targetAudience: metadata.customMetadata?.targetAudience,
            gradeId: metadata.customMetadata?.gradeId,
            subjectId: metadata.customMetadata?.subjectId
          };
        } catch (error) {
          console.error('Error getting file metadata:', error);
          return null;
        }
      });
      
      const files = await Promise.all(filePromises);
      return files.filter(file => file !== null);
      
    } catch (error) {
      console.error('Error getting files:', error);
      throw new Error('Failed to retrieve files');
    }
  }
  
  /**
   * Generate organized file path
   * @param {File} file - The file
   * @param {Object} metadata - File metadata
   * @returns {string} Generated file path
   */
  generateFilePath(file, metadata) {
    const { schoolId, fileType, userRole, gradeId, subjectId } = metadata;
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(file.name);
    
    let path = `schools/${schoolId}/${fileType}/${userRole}`;
    
    // Add grade/subject folders if specified
    if (gradeId) path += `/grade-${gradeId}`;
    if (subjectId) path += `/subject-${subjectId}`;
    
    // Add timestamp to prevent conflicts
    path += `/${timestamp}-${sanitizedFileName}`;
    
    return path;
  }
  
  /**
   * Sanitize file name for storage
   * @param {string} fileName - Original file name
   * @returns {string} Sanitized file name
   */
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }
  
  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @throws {Error} If file is invalid
   */
  validateFile(file) {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }
    
    // Check file type
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Audio/Video
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/webm'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }
  
  /**
   * Handle upload errors
   * @param {Error} error - The error object
   * @returns {Error} Formatted error
   */
  handleUploadError(error) {
    switch (error.code) {
      case 'storage/unauthorized':
        return new Error('You do not have permission to upload files');
      case 'storage/canceled':
        return new Error('Upload was canceled');
      case 'storage/quota-exceeded':
        return new Error('Storage quota exceeded');
      case 'storage/invalid-format':
        return new Error('Invalid file format');
      case 'storage/invalid-event-name':
        return new Error('Invalid upload event');
      default:
        return new Error(error.message || 'Upload failed');
    }
  }
  
  /**
   * Get file type category from MIME type
   * @param {string} mimeType - File MIME type
   * @returns {string} File category
   */
  getFileCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'spreadsheet';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
    return 'document';
  }
}

// Export singleton instance
export default new FileUploadService();
