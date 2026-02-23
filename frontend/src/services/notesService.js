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

  const response = await api.get(`/teacher/student-notes/student/notes`, {
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
