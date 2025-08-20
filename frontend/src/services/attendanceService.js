// Mock data for multiple children
const childrenData = [
  { id: 1, name: 'Emma Thompson', grade: 'Grade 8', class: 'Room 103' },
  { id: 2, name: 'James Thompson', grade: 'Grade 5', class: 'Room 201' },
  { id: 3, name: 'Olivia Garcia', grade: 'Grade 8', class: 'Room 103' },
];

const attendanceData = {
  1: [ // Emma's attendance
    { date: '2025-01-15', status: 'Present', time: '07:45', note: '' },
    { date: '2025-01-16', status: 'Present', time: '07:50', note: '' },
    { date: '2025-01-17', status: 'Absent', time: '', note: 'Sick leave' },
    { date: '2025-01-18', status: 'Present', time: '07:40', note: '' },
    { date: '2025-01-19', status: 'Late', time: '08:15', note: 'Traffic delay' },
  ],
  2: [ // James's attendance
    { date: '2025-01-15', status: 'Present', time: '07:50', note: '' },
    { date: '2025-01-16', status: 'Present', time: '07:45', note: '' },
    { date: '2025-01-18', status: 'Absent', time: '', note: 'Family emergency' },
    { date: '2025-01-20', status: 'Absent', time: '', note: 'Dentist appointment' },
    { date: '2025-01-21', status: 'Late', time: '08:05', note: '' },
  ],
  3: [], // Olivia has no records yet
};

const mockApiDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
const mockChildren = [
  { id: 'student-1', name: 'Emma Thompson' },
  { id: 'student-2', name: 'James Thompson' },
  { id: 'student-3', name: 'Olivia Martinez' },
  { id: 'student-4', name: 'Liam Garcia' },
];

const mockAttendance = {
  'student-1': [
    { date: '2025-01-20', status: 'Present', time: '08:00', note: '' },
    { date: '2025-01-21', status: 'Late', time: '08:15', note: 'Traffic delay' },
    { date: '2025-01-22', status: 'Present', time: '07:58', note: '' },
    { date: '2025-01-23', status: 'Absent', time: '', note: 'Doctor\'s appointment' },
  ],
  'student-2': [
    { date: '2025-01-20', status: 'Present', time: '07:55', note: '' },
    { date: '2025-01-21', status: 'Present', time: '07:59', note: '' },
    { date: '2025-01-22', status: 'Present', time: '08:01', note: '' },
    { date: '2025-01-23', status: 'Present', time: '07:57', note: '' },
  ],
  // ... add more mock data for other students if needed
};

// Fetches attendance for a specific list of children
export const fetchAttendanceForChildren = async (childIds) => {
  console.log('Fetching attendance for children:', childIds);
  await mockApiDelay(800);
  
  if (!childIds || childIds.length === 0) {
    return {};
  }

  const result = {};
  childIds.forEach(id => {
    if (mockAttendance[id]) {
      result[id] = mockAttendance[id];
    }
  });

  console.log('Returning attendance data:', result);
  return result;
};

// Mock data for a teacher's class
const classRoster = [
  { id: 1, name: 'Emma Thompson' },
  { id: 4, name: 'Lucas Martinez' },
  { id: 5, name: 'Chloe Wilson' },
  { id: 6, name: 'Ben Carter' },
  { id: 7, name: 'Zoe Davis' },
  { id: 3, name: 'Olivia Garcia' },
];

// Simulate fetching students for a teacher
export const fetchStudentsForClass = async (grade, subject) => {
  console.log(`Fetching students for ${grade}, ${subject}...`);
  await mockApiDelay(300);
  console.log(`Fetching students for grade: ${grade}, subject: ${subject}`);
  await mockApiDelay(700);
  // In a real app, you would post this to your backend
  // Here, we just return a slice of the mock data for demonstration
  return classRoster.slice(0, 4); // Return first 4 students as a mock class
};

// Simulate submitting attendance
export const submitAttendance = async (attendanceData) => {
  console.log('Submitting attendance:', attendanceData);
  await mockApiDelay(1200);
  // Simulate a possible error
  if (Math.random() > 0.9) { // 10% chance of failure
    throw new Error('Failed to submit attendance. Please try again.');
  }
  console.log('Attendance submitted successfully.');
  return { success: true, message: 'Attendance recorded successfully!' };
};
