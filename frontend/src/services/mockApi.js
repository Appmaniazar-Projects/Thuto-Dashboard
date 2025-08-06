// src/services/mockApi.js

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDB = {
  users: [
    { id: 1, name: 'Tiffany Pietersen', role: 'admin' },
    { id: 2, name: 'John Doe', role: 'teacher' },
  ],
  assignments: [
    { id: 1, title: 'Math Homework', dueDate: '2025-07-15', status: 'Pending' },
    { id: 2, title: 'Science Project', dueDate: '2025-07-20', status: 'Submitted' },
  ],
  grades: [
    { id: 1, subject: 'Math', grade: 'A', term: 'Term 2' },
    { id: 2, subject: 'Science', grade: 'B+', term: 'Term 2' },
  ],
  attendance: [
    { date: '2025-07-08', status: 'Present' },
    { date: '2025-07-09', status: 'Absent' },
  ],
  children: [
    { id: 1, name: 'Sophie Doe', grade: 'Grade 8' },
    { id: 2, name: 'James Doe', grade: 'Grade 10' },
  ],
  courses: [
    { id: 1, title: 'Mathematics', teacher: 'Mr. Smith' },
    { id: 2, title: 'English', teacher: 'Ms. Johnson' },
  ],
  resources: [
    { id: 1, title: 'Algebra Notes', type: 'PDF', link: '#' },
    { id: 2, title: 'Essay Guidelines', type: 'DOCX', link: '#' },
  ],
  reports: [
    { id: 1, name: 'User Activity Report', date: '2025-07-01' },
  ],
  settings: {
    theme: 'light',
    notifications: true,
  },
};

const mockApi = {
  get: async (endpoint) => {
    await delay(400); // simulate network latency
    switch (endpoint) {
      case '/admin/users':
        return { data: mockDB.users };
      case '/admin/reports':
        return { data: mockDB.reports };
      case '/admin/system':
        return { data: mockDB.settings };
      case '/teacher/assignments':
        return { data: mockDB.assignments };
      case '/teacher/grades':
        return { data: mockDB.grades };
      case '/teacher/students':
        return { data: mockDB.children };
      case '/teacher/attendance':
        return { data: mockDB.attendance };
      case '/parent/children':
        return { data: mockDB.children };
      case '/parent/academic':
        return { data: mockDB.grades };
      case '/parent/attendance':
        return { data: mockDB.attendance };
      case '/student/assignments':
        return { data: mockDB.assignments };
      case '/student/grades':
        return { data: mockDB.grades };
      case '/student/courses':
        return { data: mockDB.courses };
      case '/student/resources':
        return { data: mockDB.resources };
      default:
        throw new Error('Endpoint not found: ' + endpoint);
    }
  },
};

export default mockApi;
