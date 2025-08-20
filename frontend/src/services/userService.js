// src/services/userService.js

// This file acts as a centralized mock database for all users and their relationships.

const users = {
  // --- Students ---
  'student-1': { id: 'student-1', name: 'Emma Thompson', role: 'student', parentId: 'parent-1', teacherIds: ['teacher-1'] },
  'student-2': { id: 'student-2', name: 'James Thompson', role: 'student', parentId: 'parent-1', teacherIds: ['teacher-2'] },
  'student-3': { id: 'student-3', name: 'Olivia Garcia', role: 'student', parentId: 'parent-2', teacherIds: ['teacher-1'] },
  'student-4': { id: 'student-4', name: 'Lucas Martinez', role: 'student', parentId: 'parent-3', teacherIds: ['teacher-1'] },
  'student-5': { id: 'student-5', name: 'Chloe Wilson', role: 'student', parentId: 'parent-3', teacherIds: ['teacher-2'] },

  // --- Parents ---
  'parent-1': { id: 'parent-1', name: 'Sarah Thompson', role: 'parent', childrenIds: ['student-1', 'student-2'] },
  'parent-2': { id: 'parent-2', name: 'Maria Garcia', role: 'parent', childrenIds: ['student-3'] },
  'parent-3': { id: 'parent-3', name: 'David Wilson', role: 'parent', childrenIds: ['student-4', 'student-5'] },

  // --- Teachers ---
  'teacher-1': { 
    id: 'teacher-1', 
    name: 'John Doe', 
    role: 'teacher', 
    studentIds: ['student-1', 'student-3', 'student-4'],
    grades: ['Grade 8'],
    subjects: ['Mathematics']
  },
  'teacher-2': { 
    id: 'teacher-2', 
    name: 'Jane Smith', 
    role: 'teacher', 
    studentIds: ['student-2', 'student-5'],
    grades: ['Grade 5', 'Grade 8'],
    subjects: ['Science']
  },

  // --- Admins ---
  'admin-1': { id: 'admin-1', name: 'Tiffany Pietersen', role: 'admin' },
};

// Simulate fetching a user by their ID
export const getUserById = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(users[userId] || null);
    }, 200);
  });
};

// Simulate fetching multiple users by their IDs
export const getUsersByIds = (userIds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = userIds.map(id => users[id]).filter(Boolean);
      resolve(result);
    }, 200);
  });
};

// Simulate a login function that finds a user by name and role
export const login = (name, role) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = Object.values(users).find(u => u.name === name && u.role === role);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 300);
  });
};

// Simulate fetching all users of a specific role
export const getUsersByRole = (role) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roleUsers = Object.values(users).filter(u => u.role === role);
      resolve(roleUsers);
    }, 200);
  });
};
