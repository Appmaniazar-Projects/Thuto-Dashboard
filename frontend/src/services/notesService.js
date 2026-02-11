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
  const response = await api.get(`${API_BASE}/student/notes`, {
    params: {
      studentId: toId(studentId),
      teacherId: toId(teacherId),
    },
  });
  return coerceNotesArray(response.data);
};

export const createTeacherNote = async ({ studentId, teacherId, content }) => {
  const toId = (value) => {
    if (value === null || value === undefined || value === '') return value;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  };
  const response = await api.post(`${API_BASE}/create`, {
    studentId: toId(studentId),
    teacherId: toId(teacherId),
    content,
  });
  return response.data;
};

export const updateTeacherNote = async ({ noteId, content }) => {
  throw new Error('Updating notes is not supported by the current backend endpoints.');
};

export const deleteTeacherNote = async ({ noteId }) => {
  throw new Error('Deleting notes is not supported by the current backend endpoints.');
};
