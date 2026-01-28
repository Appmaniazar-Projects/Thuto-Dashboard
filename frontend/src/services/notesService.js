import api from './api';

const API_BASE = '/teacher/notes';

const coerceNotesArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notes)) return data.notes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getTeacherNotes = async ({ studentId, teacherId }) => {
  const response = await api.get(API_BASE, {
    params: {
      studentId,
      teacherId,
    },
  });
  return coerceNotesArray(response.data);
};

export const createTeacherNote = async ({ studentId, teacherId, content }) => {
  const response = await api.post(API_BASE, {
    studentId,
    teacherId,
    content,
  });
  return response.data;
};

export const updateTeacherNote = async ({ noteId, content }) => {
  const response = await api.put(`${API_BASE}/${noteId}`, { content });
  return response.data;
};

export const deleteTeacherNote = async ({ noteId }) => {
  const response = await api.delete(`${API_BASE}/${noteId}`);
  return response.data;
};
