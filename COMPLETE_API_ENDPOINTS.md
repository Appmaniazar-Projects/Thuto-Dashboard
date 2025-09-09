# Complete API Endpoints Documentation - Thuto Dashboard

This document contains all API endpoints with their exact request payloads, response structures, and usage details for backend implementation.

**Base URL Configuration:**
- Base URL: `process.env.REACT_APP_API_URL`
- All requests include `Authorization: Bearer {token}` header
- All requests include `schoolId` as query parameter (auto-added by interceptor)
- File uploads use `multipart/form-data`
- Downloads use `responseType: 'blob'`
- Date formats use `YYYY-MM-DD`

---

## 🔐 AUTHENTICATION ENDPOINTS

### POST /auth/login
**Description:** Phone + Firebase token authentication for Teachers/Students/Parents
**Request Body:**
```json
{
  "phoneNumber": "0761234567", // digits only, no spaces/formatting
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." // Firebase ID token from getIdToken()
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "role": "Student", // or "Teacher", "Parent"
    "phoneNumber": "0761234567",
    "schoolId": "school123"
  }
}
```

### POST /auth/admin/login
**Description:** Email/password authentication for Admins
**Request Body:**
```json
{
  "email": "admin@school.com",
  "password": "adminpassword123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "admin123",
    "name": "Admin User",
    "email": "admin@school.com",
    "role": "Admin",
    "schoolId": "school123"
  }
}
```

### POST /auth/superadmin/login
**Description:** Email/password authentication for Super Admins
**Request Body:**
```json
{
  "email": "superadmin@thuto.com",
  "password": "superadminpassword123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "superadmin123",
    "name": "Super Admin",
    "email": "superadmin@thuto.com",
    "role": "SuperAdmin"
  }
}
```

---

## 👑 SUPER ADMIN ENDPOINTS

### GET /superadmin/schools/allSchools
**Description:** Get all schools in the system
**Request:** No body
**Response:**
```json
[
  {
    "id": "school123",
    "name": "Greenwood High School",
    "location": "Springfield",
    "contactEmail": "contact@greenwood.edu",
    "adminCount": 3,
    "userCount": 540,
    "createdAt": "2023-01-15T00:00:00Z"
  }
]
```

### POST /superadmin/createSchool
**Description:** Create a new school
**Request Body:**
```json
{
  "name": "Northwood Academy",
  "location": "Northwood City",
  "contactEmail": "contact@northwood.edu",
  "address": "123 School Street",
  "phoneNumber": "0123456789"
}
```
**Response:**
```json
{
  "message": "School created successfully",
  "schoolId": "school456"
}
```

### PUT /superadmin/updateSchool/{schoolId}
**Description:** Update an existing school
**Request Body:**
```json
{
  "name": "Updated School Name",
  "location": "Updated Location",
  "contactEmail": "updated@email.com",
  "address": "Updated Address",
  "phoneNumber": "0987654321"
}
```

### DELETE /superadmin/deleteSchool/{schoolId}
**Description:** Delete a school
**Request:** No body
**Response:** 204 No Content

### GET /superadmin/school/{schoolId}
**Description:** Get detailed school information
**Request:** No body
**Response:**
```json
{
  "id": "school123",
  "name": "Greenwood High School",
  "location": "Springfield",
  "stats": {
    "admins": 3,
    "teachers": 45,
    "students": 450,
    "parents": 200
  },
  "administrators": [
    {
      "id": "admin123",
      "name": "Admin User",
      "email": "admin@school.com"
    }
  ]
}
```

### GET /superadmin/admins
**Description:** Get all administrators across all schools
**Request:** No body
**Response:**
```json
[
  {
    "id": "admin123",
    "name": "Alice Johnson",
    "email": "alice@greenwood.edu",
    "schoolName": "Greenwood High School",
    "schoolId": "school123"
  }
]
```

### POST /superadmin/admins
**Description:** Create a new administrator
**Request Body:**
```json
{
  "name": "Bob Williams",
  "email": "bob@northwood.edu",
  "password": "strongpassword123",
  "schoolId": "school456"
}
```

### PUT /superadmin/admins/{adminId}
**Description:** Update an administrator
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  //This school's id shouldn't change but should the backend handle this.
  "schoolId": "different_school_id"
}
```

### DELETE /superadmin/admins/{adminId}
**Description:** Delete an administrator
**Request:** No body
**Response:** 204 No Content

### GET /superadmin/schools/{schoolId}/admins
**Description:** Get administrators for a specific school
**Request:** No body


### GET /superadmin/stats
- This should come from what we already have acess to and the frontend should do this calculations.
**Description:** Get system-wide statistics
**Request:** No body
**Response:**
```json
{
  "totalSchools": 15,
  "totalUsers": 8500,
  "totalAdmins": 45,
  "totalTeachers": 600,
  "totalStudents": 7200,
  "totalParents": 655
}
```
- Comming soon feature
### GET /superadmin/analytics
**Description:** Get platform usage analytics
**Request:** No body

---

## 🏫 ADMIN ENDPOINTS
-Instead of /admin/students - GET /admin/allRoleSpecificUsers/{role}- students:

### GET /admin/students
**Description:** Get all students (with frontend filtering)
**Query Parameters:** `grade`, `gender`, `status` (applied on frontend)
**Request:** No body
**Response:**
```json
[
  {
    "id": "student123",
    "name": "John Doe",
    "grade": "10A",
    "gender": "Male",
    "status": "Active",
    "parentId": "parent123"
  }
]
```

### GET /admin/attendance
**Description:** Get attendance data (with frontend filtering)
**Query Parameters:** `startDate`, `endDate` (applied on frontend)
**Request:** No body

- Instead of /admin/staff - GET /admin/allRoleSpecificUsers/{role}- teachers:
### GET /admin/staff
**Description:** Get staff data (with frontend filtering)
**Query Parameters:** `role`, `department` (applied on frontend)
**Request:** No body

-Coming Soon
### GET /admin/calendar
**Description:** Get calendar events
**Request:** No body

### GET /admin/messages
**Description:** Get messages
**Request:** No body

### GET /admin/allRoleSpecificUsers/all
**Description:** Get all users with role-specific details
**Request:** No body
**Response:**
```json
[
  {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "0761234567",
    "role": "Student",
    "grade": "10A", // for students
    "subjects": ["Math", "Physics"], // for teachers
    "parentId": "parent123" // for students
  }
]
```

### GET /admin/allRoleSpecificUsers/{role}
**Description:** Get users filtered by role (Teacher, Student, Parent)
**Request:** No body
shouldn't it use POST   /createUser insead of admin/users
### POST /admin/users
**Description:** Create a new user
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com", // optional for students/parents
  "phoneNumber": "0761234567", // required for students/parents
  "role": "Student", // "Teacher", "Student", "Parent"
  "grade": "10A", // required for students
  "subjects": ["Mathematics", "Physics"], // required for teachers
  "parentId": "parent123", // required for students
  //not needed - "password": "temppassword123" // for teachers/admins
}
```

### PATCH /admin/users/{userId}
**Description:** Update an existing user
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phoneNumber": "0987654321",
  "grade": "11A", // for students
  "subjects": ["Chemistry", "Biology"] // for teachers
}
```

### DELETE /admin/users/{userId}
**Description:** Delete a user
**Request:** No body
**Response:** 204 No Content


### GET /attendance/submissions
**Description:** Get attendance submissions for review
**Request:** No body
**Response:**
```json
[
  {
    "id": "submission123",
    "teacherId": "teacher123",
    "teacherName": "Ms. Smith",
    "classId": "class123",
    "className": "Mathematics - Grade 10A",
    "date": "2023-10-27",
    "status": "Pending", // "Approved", "Rejected"
    "submittedAt": "2023-10-27T10:00:00Z"
  }
]
```

### PUT /attendance/submissions/{submissionId}
**Description:** Update attendance submission status
**Request Body:**
```json
{
  "status": "Approved", // or "Rejected"
  "comments": "Attendance approved"
}
```

---

## 👨‍🏫 TEACHER ENDPOINTS

### GET /teacher/students
**Description:** Get teacher's assigned students
**Request:** No body
**Response:**
```json
[
  {
    "id": "student123",
    "name": "John Doe",
    "grade": "10A",
    "subjects": ["Mathematics"]
  }
]
```

### GET /teacher/resources
**Description:** Get all teacher resources
**Request:** No body
**Response:**
```json
[
  {
    "id": "resource123",
    "fileName": "Chapter1Notes.pdf",
    "classId": "class123",
    "className": "Mathematics - Grade 10A",
    "description": "Chapter 1 study notes",
    "uploadDate": "2023-10-27T10:00:00Z",
    "fileUrl": "https://storage.com/file.pdf"
  }
]
```

### POST /teacher/resources/upload
**Description:** Upload a new resource
**Content-Type:** multipart/form-data
**Request Body:**
```
file: [File object] // The actual file
classId: "class123" // ID of the class
description: "Homework assignment for Chapter 1" // Optional description
```
**Response:**
```json
{
  "message": "Resource uploaded successfully",
  "resourceId": "resource456"
}
```

### DELETE /teacher/resources/{resourceId}
**Description:** Delete a resource
**Request:** No body
**Response:** 204 No Content

### GET /teacher/classes
**Description:** Get teacher's classes
**Request:** No body
**Response:**
```json
[
  {
    "id": "class123",
    "name": "Mathematics - Grade 10A",
    "grade": "10A",
    "subject": "Mathematics",
    "studentCount": 30,
    //coming soon - "schedule": "Mon, Wed, Fri - 9:00 AM"
  }
]
```
-This is for on the dashboard but we already are getting the resources so it should just use that to show the last 5 resources
### GET /teacher/resources/recent
**Description:** Get recent resources
**Query Parameters:** `limit` (default: 5)
**Request:** No body

### GET /teacher/classes/{classId}/attendance
**Description:** Get class details for attendance taking
**Request:** No body
**Response:**
```json
{
  "classId": "class123",
  "className": "Mathematics - Grade 10A",
  "students": [
    {
      "studentId": "student123",
      "name": "John Doe",
      "studentNumber": "2023001"
    }
  ]
}
```

### GET /teacher/classes/{classId}/attendance/{date}
**Description:** Get attendance for specific date
**Request:** No body
**Response:**
```json
{
  "classId": "class123",
  "date": "2023-10-27",
  "attendance": [
    {
      "studentId": "student123",
      "isPresent": true
    }
  ]
}
```

### POST /teacher/attendance
**Description:** Submit class attendance
**Request Body:**
```json
{
  "classId": "class123",
  "date": "2023-10-27", // YYYY-MM-DD format
  "attendanceType": "full_day", // "morning", "afternoon", "full_day"
  "schoolId": "school123",
  "students": [
    {
      "studentId": "student123",
      "isPresent": true
    },
    {
      "studentId": "student456",
      "isPresent": false
    }
  ]
}
```
**Response:**
```json
{
  "message": "Attendance submitted successfully",
  "submissionId": "submission123"
}
```
- Coming soon
### GET /teacher/classes/{classId}/attendance/history
**Description:** Get attendance history for a class
**Query Parameters:** `startDate`, `endDate` (YYYY-MM-DD format)
**Request:** No body

### GET /teacher/students/{studentId}/reports
**Description:** Get reports for a specific student
**Request:** No body

### POST /teacher/students/{studentId}/reports
**Description:** Upload a report for a student
**Content-Type:** multipart/form-data
**Request Body:**
```
file: [File object] // The report file
description: "Term 1 Mathematics Report" // Report description
```

---

## 🎓 STUDENT ENDPOINTS

### GET /currentUser
**Description:** Get student's profile information
**Request:** No body
**Response:**
```json
{
  "id": "student123",
  "name": "John Doe",
  "grade": "10A",
  "studentNumber": "2023001",
  "email": "john@example.com",
  "phoneNumber": "0761234567",
  "parentId": "parent123"
}
```

### PUT /currentUser
**Description:** Update student profile
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phoneNumber": "0987654321"
}
```

### GET /student/attendance
**Description:** Get student's attendance records
**Query Parameters:** `month`, `year`, `startDate`, `endDate`
**Request:** No body
**Response:**
```json
{
  "summary": {
    "presentDays": 18,
    "absentDays": 2,
    "attendanceRate": 90
  },
  "records": [
    {
      "date": "2023-10-27",
      "status": "Present", // "Present", "Absent"
      "subject": "Mathematics",
      "teacher": "Ms. Smith"
    }
  ]
}
```
- Use the attendance endpoint instead of GET /student/attendance/stats
### GET /student/attendance/stats
**Description:** Get attendance statistics
**Request:** No body
**Response:**
```json
{
  "summary": {
    "presentDays": 18,
    "absentDays": 2,
    "attendanceRate": 90
  }
}
```
### GET /student/resources
**Description:** Get available resources
**Query Parameters:** `subject`, `searchTerm`
**Request:** No body
**Response:**
```json
[
  {
    "id": "resource123",
    "title": "Chapter 1 Notes",
    "subject": "Mathematics",
    "description": "Study notes for Chapter 1",
    "uploadDate": "2023-10-27T10:00:00Z",
    "fileName": "chapter1.pdf",
    "teacherName": "Ms. Smith"
  }
]
```

### GET /student/resources/{resourceId}/download
**Description:** Download a resource file
**Request:** No body
**Response:** File blob

-Coming soon
### GET /student/schedule
**Description:** Get student's class schedule
**Query Parameters:** `week`, `date`
**Request:** No body

-Coming soon
### GET /student/timetable
**Description:** Get student's timetable
**Query Parameters:** `weekStart` (YYYY-MM-DD)
**Request:** No body

### GET /student/reports
**Description:** Get student's academic reports
**Query Parameters:** `term`, `subject`
**Request:** No body
**Response:**
```json
[
  {
    "id": "report123",
    "title": "Term 1 Report",
    "type": "Academic",
    "issueDate": "2023-04-15T00:00:00Z",
    "teacher": "Ms. Smith",
    "subject": "Mathematics",
    "fileName": "term1_report.pdf"
  }
]
```

### GET /student/reports/{reportId}/download
**Description:** Download a report file
**Request:** No body
**Response:** File blob

---

## 👨‍👩‍👧‍👦 PARENT ENDPOINTS
- This should be phoneNumber/children instead of GET /api/parent/children
### GET /api/parent/children
**Description:** Get parent's children
**Request:** No body
**Response:**
```json
[
  {
    "id": "student123",
    "name": "John Doe",
    "grade": "10A",
    "school": "Greenwood High School",
    "studentNumber": "2023001"
  }
]
```
- This should be phoneNumber/children/{childId}/dashboard instead of GET /api/parent/children/{childId}/dashboard
### GET /api/parent/children/{childId}/dashboard
**Description:** Get dashboard data for a specific child
**Request:** No body
**Response:**
```json
{
  "stats": {
    "attendance": "95%",
    "feesDue": "R1500",
    "upcomingEvents": 3,
    "newAnnouncements": 2
  },
  "recentActivity": [
    {
      "type": "attendance",
      "message": "Present in Mathematics class",
      "date": "2023-10-27"
    }
  ]
}
```
- This should be phoneNumber/children/{childId}/attendance instead of GET /api/parent/children/{childId}/attendance
### GET /api/parent/children/{childId}/attendance
**Description:** Get child's attendance records
**Query Parameters:** `month`, `year`
**Request:** No body
**Response:**
```json
{
  "summary": {
    "presentDays": 18,
    "absentDays": 2,
    "attendanceRate": 90
  },
  "records": [
    {
      "date": "2023-10-27",
      "status": "Present",
      "subject": "Mathematics",
      "teacher": "Ms. Smith"
    }
  ]
}
```
-Coming Soon
### GET /api/parent/events/upcoming
**Description:** Get upcoming events for a child
**Request:** No body

-Coming soon
### GET /api/parent/events/upcoming
**Description:** Get all upcoming events
**Request:** No body

-Coming soon
### GET /api/parent/children/{childId}/fees
**Description:** Get fee information for a child
**Request:** No body
**Response:**
```json
{
  "totalDue": "R1500",
  "dueDate": "2023-11-30",
  "breakdown": [
    {
      "description": "School Fees",
      "amount": "R1200"
    },
    {
      "description": "Transport",
      "amount": "R300"
    }
  ]
}
```
- This is just suppose to show all the reports of your children then frontend needs to filter according to children id maybe even this endpoint ### GET /reports/student/{studentId}
### GET /api/parent/children/reports
**Description:** Get child's reports
**Request:** No body

### GET /api/parent/reports/{reportId}/download
**Description:** Download a report
**Request:** No body
**Response:** File blob

---

## 📊 REPORT ENDPOINTS

### POST /reports/student/upload
**Description:** Upload a student report
**Content-Type:** multipart/form-data
**Request Body:**
```
file: [File object] // Optional report file
studentId: "student123"
academicTerm: "Term 1 2024"
grade: "10A"
comments: "Excellent progress in mathematics"
overallPerformance: "Excellent" // "Excellent", "Good", "Satisfactory", "Needs Improvement"
grades: '[{"subject": "Mathematics", "grade": "A", "comments": "Outstanding work"}]' // JSON string
```

### GET /reports/student/{studentId}
**Description:** Get reports for a student
**Request:** No body

### GET /reports/class/{classId}
**Description:** Get reports for a class
**Query Parameters:** `term`
**Request:** No body

### PUT /reports/{reportId}
**Description:** Update a report
**Request Body:**
```json
{
  "comments": "Updated comments",
  "overallPerformance": "Good",
  "grades": [
    {
      "subject": "Mathematics",
      "grade": "B+",
      "comments": "Good improvement"
    }
  ]
}
```

### DELETE /reports/{reportId}
**Description:** Delete a report
**Request:** No body

### GET /reports/{reportId}/download
**Description:** Download a report file
**Request:** No body
**Response:** File blob

### GET /reports/class/{classId}/stats
**Description:** Get class report statistics
**Query Parameters:** `term`
**Request:** No body

### GET /reports/terms
**Description:** Get available academic terms
**Request:** No body

### POST /reports/attendance
**Description:** Generate attendance report
**Request Body:**
```json
{
  "startDate": "2023-10-01",
  "endDate": "2023-10-31",
  "classId": "class123", // optional
  "format": "pdf" // or "csv"
}
```

### POST /reports/academic
**Description:** Generate academic report
**Request Body:**
```json
{
  "term": "Term 1 2024",
  "classId": "class123", // optional
  "format": "pdf"
}
```

### POST /reports/attendance/download
**Description:** Download attendance report
**Request Body:**
```json
{
  "startDate": "2023-10-01",
  "endDate": "2023-10-31",
  "format": "pdf"
}
```
**Response:** File blob

### POST /reports/academic/download
**Description:** Download academic report
**Request Body:**
```json
{
  "term": "Term 1 2024",
  "format": "pdf"
}
```
**Response:** File blob

### GET /reports/filters
**Description:** Get available report filters
**Request:** No body

---
- Coming soon
## 📅 CALENDAR ENDPOINTS

### GET /calendar
**Description:** Get calendar events
**Query Parameters:** `startDate`, `endDate` (YYYY-MM-DD format)
**Request:** No body
**Response:**
```json
[
  {
    "id": "event123",
    "title": "Parent-Teacher Meeting",
    "start": "2023-11-15T09:00:00Z",
    "end": "2023-11-15T17:00:00Z",
    "type": "meeting",
    "description": "Quarterly parent-teacher meetings"
  }
]
```

### POST /calendar
**Description:** Create a new event
**Request Body:**
```json
{
  "title": "School Sports Day",
  "start": "2023-12-01T08:00:00Z",
  "end": "2023-12-01T16:00:00Z",
  "type": "sports",
  "description": "Annual sports day event",
  "location": "School Grounds"
}
```

### PUT /calendar/{eventId}
**Description:** Update an event
**Request Body:**
```json
{
  "title": "Updated Event Title",
  "start": "2023-12-01T09:00:00Z",
  "end": "2023-12-01T17:00:00Z",
  "description": "Updated description"
}
```

### DELETE /calendar/{eventId}
**Description:** Delete an event
**Request:** No body
**Response:** 204 No Content

### GET /calendar/event-types
**Description:** Get available event types
**Request:** No body
**Response:**
```json
[
  "meeting",
  "sports",
  "academic",
  "holiday",
  "exam"
]
```

---
- Coming soon
## 📢 ANNOUNCEMENT ENDPOINTS

### GET /announcements
**Description:** Get announcements
**Query Parameters:** `limit`, `type` (parent, teacher, student)
**Request:** No body
**Response:**
```json
[
  {
    "id": "announcement123",
    "title": "School Closure Notice",
    "content": "School will be closed on November 1st for maintenance",
    "type": "general",
    "priority": "high",
    "createdAt": "2023-10-27T10:00:00Z",
    "author": "Principal"
  }
]
```

### POST /announcements
**Description:** Create an announcement
**Request Body:**
```json
{
  "title": "New Announcement",
  "content": "This is the announcement content",
  "type": "general", // "general", "academic", "sports", "emergency"
  "priority": "medium", // "low", "medium", "high"
  "targetAudience": ["students", "parents"] // array of roles
}
```

---

## 📊 ATTENDANCE ENDPOINTS

### GET /attendance/student
**Description:** Get student attendance records
**Query Parameters:** `studentId`, `startDate`, `endDate`
**Request:** No body

- Instead use what we already have and filter it by children id
### GET /attendance/student/{studentId}/stats
**Description:** Get attendance statistics for a student
**Request:** No body

---

## 💬 MESSAGE ENDPOINTS - Coming Soon

### GET /admin/system-messages
**Description:** Get system messages
**Request:** No body

### POST /admin/system-messages
**Description:** Send a system message
**Request Body:**
```json
{
  "title": "System Maintenance",
  "content": "System will be down for maintenance",
  "recipients": ["all"], // or specific user IDs
  "priority": "high",
  "type": "system"
}
```

### DELETE /admin/system-messages/{messageId}
**Description:** Delete a system message
**Request:** No body

### GET /admin/message-templates
**Description:** Get message templates
**Request:** No body

### POST /admin/message-templates
**Description:** Create a message template
**Request Body:**
```json
{
  "name": "Welcome Message",
  "subject": "Welcome to {{schoolName}}",
  "content": "Dear {{studentName}}, welcome to our school!",
  "type": "welcome"
}
```

### PUT /admin/message-templates/{templateId}
**Description:** Update a message template
**Request Body:**
```json
{
  "name": "Updated Template",
  "subject": "Updated Subject",
  "content": "Updated content"
}
```

### DELETE /admin/message-templates/{templateId}
**Description:** Delete a message template
**Request:** No body

### GET /admin/messages/analytics
**Description:** Get message analytics
**Request:** No body

### PATCH /messages/{messageId}/status
**Description:** Update message status
**Request Body:**
```json
{
  "status": "read", // "read", "unread", "archived"
  "readAt": "2023-10-27T10:00:00Z"
}
```

### POST /admin/broadcast
**Description:** Broadcast a message
**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "This is an important broadcast message",
  "recipients": "all", // or "teachers", "students", "parents"
  "priority": "high"
}
```

### POST /admin/emergency-alerts
**Description:** Send emergency alert
**Request Body:**
```json
{
  "title": "Emergency Alert",
  "content": "This is an emergency alert message",
  "recipients": "all",
  "alertType": "emergency"
}
```

### GET /messages/search
**Description:** Search messages
**Query Parameters:** `query`, `type`, `dateFrom`, `dateTo`
**Request:** No body

### PATCH /messages/bulk-update
**Description:** Bulk update messages
**Request Body:**
```json
{
  "messageIds": ["msg1", "msg2", "msg3"],
  "status": "read",
  "action": "mark_read" // "mark_read", "archive", "delete"
}
```

### GET /admin/messages/statistics
**Description:** Get message statistics
**Query Parameters:** `timeRange` (default: "30d")
**Request:** No body

---

## 🔔 NOTIFICATION ENDPOINTS - Coming soon

**Note:** Notification service uses WebSocket connections and mock implementations. Real-time notifications would be handled via WebSocket events rather than REST endpoints.

### WebSocket Events:
- `connection_changed`: Connection status updates
- `new_notification`: New notification received
- `notification_read`: Notification marked as read

---

## 📝 COMMON REQUEST PATTERNS

### Authentication Headers
All authenticated requests require:
```
Authorization: Bearer {jwt_token}
```

### School Context
All requests automatically include:
```
?schoolId={school_id}
```

### File Upload Format
File uploads use `multipart/form-data`:
```
Content-Type: multipart/form-data
file: [File object]
additionalField: "value"
```

### Date Formats
- API dates: `YYYY-MM-DD`
- DateTime: `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601)

### Error Responses
Standard error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Pagination (where applicable)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🚀 DEPLOYMENT NOTES

1. **Environment Variables Required:**
   - `REACT_APP_API_URL`: Backend API base URL
   - Firebase configuration variables

2. **CORS Configuration:**
   - Allow frontend domain
   - Include credentials for authentication

3. **File Storage:**
   - Configure file upload limits
   - Set up cloud storage (AWS S3, Google Cloud Storage, etc.)

4. **Database Schema:**
   - Users table with role-based fields
   - Schools table for multi-tenancy
   - Attendance, Reports, Resources tables
   - Proper foreign key relationships

5. **Authentication:**
   - JWT token implementation
   - Firebase Admin SDK for OTP verification
   - Role-based access control (RBAC)
