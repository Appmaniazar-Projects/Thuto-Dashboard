import api from './api';

const API_BASE = '/teacher/student-notes';

const coerceNotesArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notes)) return data.notes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getTeacherNotes = async ({ studentId, teacherId }) => {
  const toId = (value) => {
    if (value === null || value === undefined || value === '') return value;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  };
  const schoolId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return localStorage.getItem('schoolId') || user?.school?.id || user?.schoolId || null;
    } catch {
      return localStorage.getItem('schoolId') || null;
    }
  })();

  const response = await api.post(`${API_BASE}/student/notes`, {
    teacherId: toId(teacherId),
    studentId: toId(studentId),
    schoolId: toId(schoolId),
  });
  return coerceNotesArray(response.data);
};

const toId = (value) => {
  if (value === null || value === undefined || value === '') return value;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
};

const getSchoolId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return localStorage.getItem('schoolId') || user?.school?.id || user?.schoolId || null;
  } catch {
    return localStorage.getItem('schoolId') || null;
  }
};

const toBackendDateOnly = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const createTeacherNote = async ({ studentId, teacherId, note, noteDate, category, schoolId }) => {
  const payload = {
    note: note ?? '',
    noteDate: toBackendDateOnly(noteDate) || toBackendDateOnly(new Date()),
    teacherId: toId(teacherId),
    studentId: toId(studentId),
    schoolId: toId(schoolId ?? getSchoolId()),
    category: category ?? 'General',
  };

  const response = await api.post(`${API_BASE}/create`, payload);
  return response.data;
};

export const updateTeacherNote = async ({ id, note, noteDate, teacherId, studentId, category, schoolId }) => {
  const payload = {
    id: toId(id),
    note: note ?? '',
    noteDate: toBackendDateOnly(noteDate) || toBackendDateOnly(new Date()),
    teacherId: toId(teacherId),
    studentId: toId(studentId),
    schoolId: toId(schoolId ?? getSchoolId()),
    category: category ?? 'General',
  };

  const response = await api.put(`${API_BASE}/update`, payload);
  return response.data;
};

export const deleteTeacherNote = async ({ id }) => {
  const response = await api.delete(`${API_BASE}/delete/${toId(id)}`);
  return response.data;
};

/**
 * Export all teacher notes for a student to a text file
 * @param {string} studentId - The student ID
 * @param {string} studentName - The student name (for filename)
 * @param {string} teacherId - The teacher ID (optional, will try to get from localStorage)
 */
export const exportStudentNotesToTxt = async (studentId, studentName, teacherId) => {
  try {
    const schoolId = getSchoolId();
    
    // Get teacherId if not provided
    let resolvedTeacherId = teacherId;
    if (!resolvedTeacherId) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        resolvedTeacherId = user?.id || user?.userId || user?.phoneNumber;
      } catch (e) {
        console.warn('Could not get teacherId from localStorage:', e);
      }
    }
    
    if (!studentId) {
      throw new Error('Student ID is required for export');
    }
    
    if (!schoolId) {
      throw new Error('School ID is required for export');
    }
    
    console.log('Exporting notes for student:', { studentId, studentName, teacherId: resolvedTeacherId, schoolId });
    
    // Try multiple approaches to get notes
    let notes = [];
    
    // First try: Get notes with teacherId
    if (resolvedTeacherId) {
      try {
        const response = await api.post(`${API_BASE}/student/notes`, {
          studentId,
          teacherId: resolvedTeacherId,
          schoolId
        });
        notes = response.data || [];
      } catch (e) {
        console.warn('Failed to get notes with teacherId, trying without:', e.response?.status);
      }
    }
    
    // Second try: Get notes without teacherId (all notes for student)
    if (!notes.length) {
      try {
        const response = await api.post(`${API_BASE}/student/notes`, {
          studentId,
          schoolId
        });
        notes = response.data || [];
      } catch (e) {
        console.error('Failed to get notes for export:', e);
        throw new Error('Failed to retrieve notes for export');
      }
    }
    
    if (!notes.length) {
      throw new Error('No notes found for this student');
    }

    // Create text content
    let textContent = `Notes for ${studentName}\n`;
    textContent += `Generated on: ${new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })}, ${new Date().toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    
    notes.forEach((note, index) => {
      // Format date to DD/MM/YYYY format
      let formattedDate = 'N/A';
      if (note.noteDate) {
        try {
          const date = new Date(note.noteDate);
          formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          });
        } catch (e) {
          console.warn('Invalid date format:', note.noteDate);
        }
      }
      
      // Extract teacher name from various possible fields
      let teacherName = note.teacherName || 
                       note.teacher?.name || 
                       note.teacher?.fullName ||
                       note.createdBy ||
                       'N/A';
      
      // Always try to get teacher info from current user if they're a teacher and teacherId matches
      if (teacherName === 'N/A' || typeof teacherName === 'number' || !teacherName) {
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('Trying to resolve teacher name:', {
            currentUserRole: currentUser.role,
            currentUserId: currentUser.id || currentUser.userId || currentUser.phoneNumber,
            noteTeacherId: note.teacherId,
            comparison: currentUser.id == note.teacherId || currentUser.userId == note.teacherId || currentUser.phoneNumber == note.teacherId
          });
          
          if (currentUser.role === 'TEACHER' && (
            currentUser.id == note.teacherId || 
            currentUser.userId == note.teacherId || 
            currentUser.phoneNumber == note.teacherId
          )) {
            teacherName = `${currentUser.name || ''} ${currentUser.lastName || ''}`.trim() || 
                        currentUser.fullName || 
                        currentUser.name || 
                        'Current Teacher';
            console.log('Resolved teacher name:', teacherName);
          } else if (typeof teacherName === 'number') {
            teacherName = `Teacher ID: ${teacherName}`;
          }
        } catch (e) {
          console.warn('Could not resolve teacher name:', e);
          if (typeof teacherName === 'number') {
            teacherName = `Teacher ID: ${teacherName}`;
          }
        }
      }
      
      textContent += `Note #${index + 1}\n`;
      textContent += `Date: ${formattedDate}\n`;
      textContent += `Note: ${note.note || 'N/A'}\n`;
      textContent += `Teacher: ${teacherName}\n`;
      textContent += `${'-'.repeat(30)}\n\n`;
    });
    
    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Clean filename for download
    const cleanName = (studentName || 'student').replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `notes_${cleanName}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to export notes:', error);
    throw error;
  }
};

export const exportStudentNotes = async (studentId) => {
  try {
    const schoolId = getSchoolId();
    
    if (!studentId) {
      throw new Error('Student ID is required for export');
    }
    
    if (!schoolId) {
      throw new Error('School ID is required for export');
    }
    
    console.log('Exporting notes blob for student:', { studentId, schoolId });
    
    // Try multiple export endpoints
    const endpoints = [
      `${API_BASE}/student/${toId(studentId)}/export`,
      `${API_BASE}/export/student/${toId(studentId)}`,
      `${API_BASE}/student/notes/export`,
      `${API_BASE}/export`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, {
          params: { schoolId: toId(schoolId), studentId: toId(studentId) },
          responseType: 'blob',
        });
        
        console.log('Export successful via:', endpoint);
        return response.data;
      } catch (err) {
        lastError = err;
        console.warn(`Failed to export via ${endpoint}:`, err.response?.status);
        continue;
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All export endpoints failed');
    
  } catch (error) {
    console.error('Error exporting student notes:', error);
    console.error('Request details:', {
      studentId,
      schoolId: getSchoolId(),
      errorStatus: error?.response?.status,
      errorData: error?.response?.data
    });
    throw error;
  }
};
