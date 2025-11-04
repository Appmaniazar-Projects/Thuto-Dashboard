# Thuto Dashboard - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [API Endpoints](#api-endpoints)
5. [Frontend Structure](#frontend-structure)
6. [Backend Integration](#backend-integration)
7. [Development Guidelines](#development-guidelines)
8. [Deployment](#deployment)

## Project Overview

Thuto Dashboard is a comprehensive educational management system designed for South African schools. It provides role-based access for students, teachers, parents, and administrators to manage various aspects of school operations.

### Key Features
- **Multi-role Authentication**: Students, Teachers, Parents, Administrators, Super Administrators
- **Attendance Management**: Real-time attendance tracking and reporting
- **Resource Management**: Document and file sharing system
- **Report Generation**: Academic and attendance reports
- **Subject & Grade Management**: Academic structure management
- **Parent Portal**: Child monitoring and communication
- **Admin Dashboard**: School operations management

### Technology Stack
- **Frontend**: React 18, Material-UI, Firebase Authentication
- **Backend**: Java Spring Boot, MySQL Database
- **Authentication**: Firebase Phone Authentication + JWT
- **File Storage**: Firebase Storage
- **Deployment**: Railway (Frontend & Backend)

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   JWT Tokens    │    │   File Storage  │
│   Auth & Storage│    │   & Security    │    │   (Firebase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Role-specific dashboards
│   ├── common/          # Shared components
│   └── admin/           # Admin-specific components
├── pages/               # Page-level components
│   ├── student/         # Student pages
│   ├── teacher/         # Teacher pages
│   ├── parent/          # Parent pages
│   └── admin/           # Admin pages
├── services/            # API service modules
├── context/             # React Context providers
├── config/              # Configuration files
└── utils/               # Utility functions
```

## Authentication System

### Authentication Flow
1. **Phone Number Entry**: User enters phone number
2. **Firebase OTP**: Firebase sends SMS with verification code
3. **OTP Verification**: User enters OTP code
4. **Backend Validation**: Backend validates user and returns JWT
5. **Role-based Redirect**: User redirected to appropriate dashboard

### Supported User Roles
- **Student**: Access to attendance, resources, reports
- **Teacher**: Class management, attendance submission, resource upload
- **Parent**: Child monitoring, attendance viewing, report access
- **Administrator**: School management, user administration
- **Super Administrator**: Multi-school management, system administration

### Authentication Endpoints
```
POST /auth/login                    # Students, Teachers, Parents, Admins
POST /auth/superadmin/login         # Super Administrators only
POST /auth/{userId}/logout          # Logout endpoint
```

## API Endpoints

### Student Endpoints
```
GET  /student/attendance            # Get student attendance
GET  /student/reports               # Get student reports
GET  /student/resources             # Get available resources
PUT  /student/profile               # Update student profile
```

### Teacher Endpoints
```
GET  /teacher/students              # Get teacher's students
GET  /teacher/resources             # Get teacher resources
POST /teacher/resources/upload      # Upload resource
GET  /teacher/resources/recent      # Get recent resources
POST /teacher/attendance            # Submit attendance
```

### Parent Endpoints
```
GET  /api/parent/children           # Get parent's children
GET  /api/parent/children/{id}/dashboard    # Get child dashboard
GET  /api/parent/children/{id}/attendance   # Get child attendance
```

### Admin Endpoints
```
GET  /admin/allRoleSpecificUsers/all        # Get all users
GET  /admin/allRoleSpecificUsers/{role}     # Get users by role
POST /admin/users                           # Create user
PATCH /admin/users/{userId}                 # Update user
DELETE /admin/users/{userId}                # Delete user
```

### Attendance Endpoints
```
GET  /attendance/student/{studentId}        # Get student attendance
GET  /attendance/submissions                # Get attendance submissions
PUT  /attendance/submissions/{id}           # Update submission
```

## Frontend Structure

### Service Layer
All API communications are handled through service modules:

- **`attendanceService.js`**: Attendance-related operations
- **`studentService.js`**: Student profile and data management
- **`teacherService.js`**: Teacher-specific operations
- **`parentService.js`**: Parent portal functionality
- **`adminService.js`**: Administrative operations
- **`authService.js`**: Authentication operations

### Context Providers
- **`AuthContext`**: User authentication and session management
- **`DataContext`**: Global data state management
- **`ParentContext`**: Parent-specific data management

### Component Structure
```
components/
├── auth/
│   ├── Login.js                 # Phone + OTP authentication
│   ├── AdminLogin.js            # Admin email/password login
│   └── LandingPage.js           # Role selection page
├── dashboard/
│   ├── StudentDashboard.js      # Student main dashboard
│   ├── TeacherDashboard.js      # Teacher main dashboard
│   ├── ParentDashboard.js       # Parent main dashboard
│   └── AdminDashboard.js        # Admin main dashboard
└── common/
    ├── Layout.js                # Main application layout
    ├── Sidebar.js               # Navigation sidebar
    └── StatCard.js              # Statistics display card
```

## Backend Integration

### API Configuration
- **Base URL**: Configured in `src/services/api.js`
- **Authentication**: JWT tokens in Authorization header
- **School Context**: `schoolId` automatically added to requests
- **Error Handling**: Centralized error interceptors

### Data Flow
1. **Frontend Service** → Makes API call
2. **API Interceptor** → Adds authentication & school context
3. **Backend Controller** → Processes request
4. **Database** → Data persistence
5. **Response** → Returns to frontend service
6. **Component** → Updates UI state

### Frontend Filtering
All data filtering is performed on the frontend to reduce backend complexity:
- Attendance filtering by date/status
- User filtering by role/status
- Report filtering by term/subject
- Resource filtering by type/date

## Development Guidelines

### Code Style
- **JSDoc Comments**: All functions must have comprehensive documentation
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: All async operations must show loading indicators
- **Responsive Design**: Mobile-first approach with Material-UI breakpoints

### Component Guidelines
```javascript
/**
 * Component Description
 * 
 * Detailed explanation of component purpose and functionality
 * 
 * @component
 * @author Thuto Dashboard Team
 * @version 1.0.0
 */
const MyComponent = () => {
  // Component implementation
};
```

### Service Guidelines
```javascript
/**
 * Service function description
 * 
 * @param {string} param1 - Parameter description
 * @returns {Promise<Object>} Return value description
 * @throws {Error} Error conditions
 * 
 * @example
 * const result = await myFunction('example');
 */
export const myFunction = async (param1) => {
  // Function implementation
};
```

### State Management
- Use React Context for global state
- Local component state for UI-specific data
- Custom hooks for reusable stateful logic
- Proper cleanup in useEffect hooks

## Deployment

### Frontend Deployment (Railway)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd frontend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd frontend && npm start"
  }
}
```

### Environment Variables
```
REACT_APP_API_BASE_URL=https://your-backend-url.railway.app
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### Build Process
1. Install dependencies: `npm install`
2. Build production bundle: `npm run build`
3. Deploy to Railway: Automatic deployment on push
4. Environment configuration: Set via Railway dashboard

## Security Considerations

### Authentication Security
- Firebase phone authentication with OTP verification
- JWT tokens with expiration
- Automatic token refresh
- Secure logout with token invalidation

### Data Security
- Role-based access control
- School-level data isolation
- Input validation and sanitization
- HTTPS enforcement

### Frontend Security
- No sensitive data in localStorage
- Secure API communication
- XSS prevention with React's built-in protections
- CSRF protection via JWT tokens

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Efficient re-rendering with React.memo()
- Debounced search and filtering

### API Optimization
- Frontend-only filtering to reduce backend load
- Efficient data fetching with proper caching
- Pagination for large datasets
- Optimistic UI updates

## Troubleshooting

### Common Issues
1. **Authentication Failures**: Check Firebase configuration and phone number format
2. **API Errors**: Verify backend URL and authentication tokens
3. **Role Access Issues**: Ensure proper role assignment in backend
4. **Loading Issues**: Check network connectivity and error handling

### Debug Tools
- Browser Developer Tools for frontend debugging
- Network tab for API request inspection
- Console logs for error tracking
- React Developer Tools for component inspection

---

**Last Updated**: October 2025  
**Version**: 2.0.0  
**Maintained by**: Thuto Dashboard Team
