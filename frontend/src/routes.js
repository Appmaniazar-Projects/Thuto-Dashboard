// src/routes.js
import { Navigate } from 'react-router-dom';
import { lazy, Suspense, isValidElement } from 'react';
import { CircularProgress } from '@mui/material';
import AuthLayout from './components/layout/AuthLayout';
import Layout from './components/layout/Layout';

const Login = lazy(() => import('./components/auth/Login'));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const StudentSubjects = lazy(() => import('./pages/student/StudentSubjects'));
const Resources = lazy(() => import('./pages/student/Resources'));
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'));
const StudentReports = lazy(() => import('./pages/student/StudentReports'));

const ParentDashboardPage = lazy(() => import('./components/dashboard/ParentDashboard'));
const ParentChildrenPage = lazy(() => import('./pages/parent/Children'));
const ParentAcademicReportsPage = lazy(() => import('./pages/parent/Academic'));
const ParentReports = lazy(() => import('./pages/parent/ParentReportsPage'));

const AttendanceRegisterPage = lazy(() => import('./pages/teacher/AttendanceRegisterPage'));
const UploadReportPage = lazy(() => import('./pages/teacher/UploadReportPage'));
const UploadedResources = lazy(() => import('./components/dashboard/teacher/Resources'));

const UserManagementPage = lazy(() => import('./pages/admin/Users'));
const AdminReportsPage = lazy(() => 
  import('./pages/admin/Reports').then(module => ({ default: module.Reports }))
);
const UserStatistics = lazy(() => import('./components/admin/reports/UserStatistics'));
const AttendanceSubmissions = lazy(() => import('./components/admin/reports/AttendanceSubmissions'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettings'));
const SystemMessagesPanel = lazy(() => import('./components/admin/SystemMessagesPanel'));
const AdminAttendancePage = lazy(() => import('./pages/admin/AdminAttendancePage'));
const GradeManagement = lazy(() => import('./components/admin/GradeManagement'));
const SubjectManagement = lazy(() => import('./components/admin/SubjectManagement'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const AnnouncementsPage = lazy(() => import('./pages/common/AnnouncementsPage'));
const CreateAnnouncementPage = lazy(() => import('./pages/common/CreateAnnouncementPage'));

// Super Admin
const SuperAdminLogin = lazy(() => import('./components/auth/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const isRedirect = (element) =>
  isValidElement(element) && element.type === Navigate;

// Only wrap in suspense here — layout is handled in App.js


export const publicRoutes = [
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/superadmin/login', element: <SuperAdminLogin /> },
  { path: '*', element: <NotFoundPage /> }
];

const protectedRoutes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/calendar', element: <CalendarPage /> },
  { path: '/messages', element: <MessagesPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/events/create', element: <CreateEventPage /> },
  { path: '/calendar/event/new', element: <CreateEventPage /> },
  { path: '/announcements', element: <AnnouncementsPage /> },
  { path: '/announcements/create', element: <CreateAnnouncementPage /> },

  // Student
  { path: '/student/subjects', element: <StudentSubjects /> },
  { path: '/student/resources', element: <Resources /> },
  { path: '/student/attendance', element: <StudentAttendance /> },
  { path: '/student/reports', element: <StudentReports /> },

  // Parent
  { path: '/parent/dashboard', element: <ParentDashboardPage /> },
  { path: '/parent/children', element: <ParentChildrenPage /> },
  { path: '/parent/academic', element: <ParentAcademicReportsPage /> },
  { path: '/parent/reports', element: <ParentReports /> },

  // Teacher
  { path: '/teacher/attendance', element: <AttendanceRegisterPage /> },
  { path: '/teacher/resources', element: <UploadedResources /> },
  { path: '/teacher/upload-report', element: <UploadReportPage /> },
  

  // Admin
  { path: '/admin/users', element: <UserManagementPage /> },
  { path: '/admin/reports', element: <AdminReportsPage /> },
  { path: '/admin/reports/users', element: <UserStatistics /> },
  { path: '/admin/reports/attendance', element: <AttendanceSubmissions /> },
  { path: '/admin/settings', element: <SystemSettingsPage /> },
  { path: '/admin/messages', element: <SystemMessagesPanel /> },
  { path: '/admin/attendance', element: <AdminAttendancePage /> },
  { path: '/admin/grades', element: <GradeManagement /> },
  { path: '/admin/subjects', element: <SubjectManagement /> },


  // Redirects
  { path: '/my-subjects', element: <Navigate to="/student/subjects" replace /> },
  { path: '/student-reports', element: <Navigate to="/student/reports" replace /> },
  { path: '/children', element: <Navigate to="/parent/children" replace /> },
  { path: '/academic', element: <Navigate to="/parent/academic" replace /> },
  { path: '/academic-reports', element: <Navigate to="/parent/academic" replace /> },
  { path: '/parent-reports', element: <Navigate to="/parent/reports" replace /> },
  { path: '/attendance', element: <Navigate to="/teacher/attendance" replace /> },
  { path: '/resources', element: <Navigate to="/teacher/resources" replace /> },
  { path: '/users', element: <Navigate to="/admin/users" replace /> },
  { path: '/reports', element: <Navigate to="/admin/reports" replace /> },
  { path: '/system', element: <Navigate to="/admin/settings" replace /> }
];

// Create route elements with proper layout and suspense
const createPublicRouteElement = (element) => {
  if (isRedirect(element)) return element;
  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>{element}</AuthLayout>
    </Suspense>
  );
};

const createProtectedRouteElement = (element) => {
  if (isRedirect(element)) return element;
  return (
    <Suspense fallback={<Loading />}>
      <Layout>{element}</Layout>
    </Suspense>
  );
};

// Process routes
const processRoutes = (routes, isProtected = false) => {
  return routes.map(route => ({
    ...route,
    element: isProtected 
      ? createProtectedRouteElement(route.element)
      : createPublicRouteElement(route.element)
  }));
};

// Combine all routes
const routes = [
  // Public routes
  ...processRoutes(publicRoutes, false),
  
  // Protected routes with authentication
  ...processRoutes(protectedRoutes, true),
  
  // Catch all route - redirect to dashboard if authenticated, otherwise to login
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
];

export const superAdminRoutes = [
  { path: '/superadmin/dashboard', element: <SuperAdminDashboard /> },
  { path: '/superadmin/schools', element: <Navigate to="/superadmin/dashboard" replace /> },
  { path: '/superadmin/admins', element: <Navigate to="/superadmin/dashboard" replace /> },
];

export { protectedRoutes };

export default routes;
