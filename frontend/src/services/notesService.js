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

export const createTeacherNote = async ({ studentId, teacherId, note, noteDate, schoolId }) => {
  const payload = {
    note: note ?? '',
    noteDate: toBackendDateOnly(noteDate) || toBackendDateOnly(new Date()),
    teacherId: toId(teacherId),
    studentId: toId(studentId),
    schoolId: toId(schoolId ?? getSchoolId()),
  };

  const response = await api.post(`${API_BASE}/create`, payload);
  return response.data;
};

export const updateTeacherNote = async ({ id, note, noteDate, teacherId, studentId, schoolId }) => {
  const payload = {
    id: toId(id),
    note: note ?? '',
    noteDate: toBackendDateOnly(noteDate) || toBackendDateOnly(new Date()),
    teacherId: toId(teacherId),
    studentId: toId(studentId),
    schoolId: toId(schoolId ?? getSchoolId()),
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
 */
export const exportStudentNotesToTxt = async (studentId, studentName) => {
  try {
    const schoolId = getSchoolId();
    const response = await api.get(`${API_BASE}/student/${studentId}`, {
      params: { schoolId }
    });
    
    const notes = response.data || [];
    
    if (!notes.length) {
      throw new Error('No notes found for this student');
    }

    // Create text content
    let textContent = `Notes for ${studentName}\n`;
    textContent += `Generated on: ${new Date().toLocaleString()}\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    
    notes.forEach((note, index) => {
      textContent += `Note #${index + 1}\n`;
      textContent += `Date: ${note.noteDate || 'N/A'}\n`;
      textContent += `Note: ${note.note || 'N/A'}\n`;
      textContent += `Teacher: ${note.teacherName || 'N/A'}\n`;
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
  const schoolId = getSchoolId();
  const response = await api.get(`${API_BASE}/student/${toId(studentId)}/export`, {
    params: { schoolId: toId(schoolId) },
    responseType: 'blob',
  });
  return response.data;
};
