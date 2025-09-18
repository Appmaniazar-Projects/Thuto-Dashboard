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

### POST /api/auth/login
**Description:** Phone + Firebase token authentication for Teachers/Students/Parents
**Request Body:**
```json
{
  "phoneNumber": "0761234567", // optional - extracted from Firebase token
  "idToken": "firebase_id_token_string" // Firebase ID token - required
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
    "email": "john@example.com", // optional for students/parents
    "schoolId": "school123"
  }
}
```

### POST /api/auth/superadmin/login
**Description:** Email/password authentication for Admins, Super Admins and Master users
**Request Body:**
```json
{
  "email": "admin@school.com", // or "superadmin@thuto.com"
  "password": "password123"
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
    "role": "admin", // or "superadmin"
    "schoolId": "school123", // null for superadmins
    "level": "provincial", // only for superadmins: "master" or "provincial"
    "province": "Gauteng" // only for superadmins: required for provincial, optional for master
  }
}
```

---

## 🏆 MASTER ROLE ENDPOINTS

### GET /api/master/superadmins
**Description:** Get all provincial superadmins (Master users only)
**Request:** No body
**Response:**
```json
[
  {
    "id": "superadmin123",
    "name": "John Smith",
    "email": "john@gauteng.gov.za",
    "province": "Gauteng",
    "level": "provincial",
    "isActive": true,
    "createdAt": "2023-01-15T00:00:00Z",
    "lastLogin": "2023-10-27T10:00:00Z"
  }
]
```

### POST /api/master/superadmins
**Description:** Create a new provincial superadmin (Master users only)
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@western-cape.gov.za",
  "password": "securepassword123",
  "province": "Western Cape",
  "role": "superadmin",
  "level": "provincial"
}
```
**Response:**
```json
{
  "message": "Provincial superadmin created successfully",
  "superadminId": "superadmin456"
}
```

### PUT /api/master/superadmins/{superadminId}
**Description:** Update a provincial superadmin (Master users only)
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@province.gov.za",
  "province": "KwaZulu-Natal",
  "isActive": true
}
```

### DELETE /api/master/superadmins/{superadminId}
**Description:** Delete a provincial superadmin (Master users only)
**Request:** No body
**Response:** 204 No Content

---

## 👑 SUPER ADMIN ENDPOINTS

### GET /api/superadmin/schools/allSchools
**Description:** Get all schools in the system (with optional province filtering for Master users)
**Query Parameters:** `province` (optional, for Master users to filter by province)
**Request:** No body
**Response:**
```json
[
  {
    "id": "school123",
    "name": "Greenwood High School",
    "address": "123 School Street, Springfield",
    "province": "Gauteng",
    "email": "contact@greenwood.edu",
    "phoneNumber": "0123456789",
    "principalName": "Dr. Smith",
    "adminCount": 3,
    "userCount": 540,
    "subjects": ["Mathematics", "English", "Science"],
    "grades": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    "createdAt": "2023-01-15T00:00:00Z"
  }
]
```

### POST /api/superadmin/createSchool
**Description:** Create a new school
**Request Body:**
```json
{
  "name": "Northwood Academy",
  "address": "123 School Street, Northwood City",
  "province": "Western Cape",
  "email": "contact@northwood.edu",
  "phoneNumber": "0123456789",
  "principalName": "Dr. Johnson",
  "subjects": ["subject_id_1", "subject_id_2"],
  "grades": ["grade_id_1", "grade_id_2"]
}
```
**Response:**
```json
{
  "message": "School created successfully",
  "schoolId": "school456"
}
```

### PUT /api/superadmin/updateSchool/{schoolId}
**Description:** Update an existing school
**Request Body:**
```json
{
  "name": "Updated School Name",
  "address": "Updated Address",
  "province": "Updated Province",
  "email": "updated@email.com",
  "phoneNumber": "0987654321",
  "principalName": "Updated Principal",
  "subjects": ["updated_subject_ids"],
  "grades": ["updated_grade_ids"]
}
```

### DELETE /api/superadmin/deleteSchool/{schoolId}
**Description:** Delete a school
**Request:** No body
**Response:** 204 No Content

### GET /api/superadmin/school/{schoolId}
**Description:** Get detailed school information
**Request:** No body
**Response:**
```json
{
  "id": "school123",
  "name": "Greenwood High School",
  "address": "123 School Street, Springfield",
  "province": "Gauteng",
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

### GET /api/superadmin/admins
**Description:** Get all administrators across all schools (with optional province filtering)
**Query Parameters:** `province` (optional, for Master users to filter by province)
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

### POST /api/superadmin/admins
**Description:** Create a new administrator
**Request Body:**
```json
{
  "name": "Bob Williams",
  "email": "bob@northwood.edu",
  "password": "strongpassword123",
  "phoneNumber": "0761234567",
  "schoolId": "school456"
}
```

### PUT /api/superadmin/admins/{adminId}
**Description:** Update an administrator
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phoneNumber": "0987654321",
  "schoolId": "different_school_id"
}
```

### DELETE /api/superadmin/admins/{adminId}
**Description:** Delete an administrator
**Request:** No body
**Response:** 204 No Content

### GET /api/superadmin/schools/{schoolId}/admins
**Description:** Get administrators for a specific school
**Request:** No body

### GET /api/superadmin/stats
**Description:** Get system-wide statistics (with optional province filtering for Master users)
**Query Parameters:** `province` (optional, for Master users to filter by province)
**Request:** No body
**Response:**
```json
{
  "totalSchools": 15,
  "totalUsers": 8500,
  "totalAdmins": 45,
  "totalTeachers": 600,
  "totalStudents": 7200,
  "totalParents": 655,
  "province": "Gauteng"
}
```

### GET /api/superadmin/analytics
**Description:** Get platform usage analytics (with optional province filtering for Master users)
**Query Parameters:** `province` (optional, for Master users to filter by province)
**Request:** No body

---

## 🎓 GRADE MANAGEMENT ENDPOINTS

### POST /api/grades
**Description:** Create a new grade/class
**Request Body:**
```json
{
  "name": "Grade 10A",
  "description": "Grade 10 Mathematics class"
}
```

### PUT /api/grades/{gradeId}
**Description:** Update an existing grade
**Request Body:**
```json
{
  "name": "Updated Grade Name",
  "description": "Updated description"
}
```

### GET /api/grades/grades
**Description:** Get all grades in the system (system-wide for superadmins)
**Request:** No body

### GET /api/grades
**Description:** Get grades for current school
**Request:** No body

### GET /api/grades/{gradeId}/students
**Description:** Get students by grade
**Request:** No body

### GET /api/grades/teacher/{teacherId}
**Description:** Get grades assigned to a specific teacher
**Request:** No body

### POST /api/grades/{gradeId}/assign-student/{studentId}
**Description:** Assign a student to a grade
**Request:** No body

### POST /api/grades/{gradeId}/assign-teacher/{teacherId}
**Description:** Assign a teacher to a grade
**Request:** No body

### DELETE /api/grades/{gradeId}
**Description:** Delete a grade
**Request:** No body

---

## 📚 SUBJECT MANAGEMENT ENDPOINTS

### POST /api/subjects
**Description:** Create a new subject
**Request Body:**
```json
{
  "name": "Mathematics",
  "description": "Advanced Mathematics curriculum"
}
```

### PUT /api/subjects/{subjectId}
**Description:** Update an existing subject
**Request Body:**
```json
{
  "name": "Updated Subject Name",
  "description": "Updated description"
}
```

### GET /api/subjects
**Description:** Get subjects for current school
**Request:** No body

### GET /api/subjects/teacher/{teacherId}
**Description:** Get subjects assigned to a specific teacher
**Request:** No body

### POST /api/subjects/{subjectId}/assign-teacher/{teacherId}
**Description:** Assign a teacher to a subject
**Request:** No body

### DELETE /api/subjects/{subjectId}
**Description:** Delete a subject
**Request:** No body

---

## 🏫 ADMIN ENDPOINTS

### GET /api/admin/students
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

### GET /api/admin/attendance
**Description:** Get attendance data (with frontend filtering)
**Query Parameters:** `startDate`, `endDate` (applied on frontend)
**Request:** No body

### GET /api/admin/staff
**Description:** Get staff data (with frontend filtering)
**Query Parameters:** `role`, `department` (applied on frontend)
**Request:** No body

### GET /api/admin/calendar
**Description:** Get calendar events
**Request:** No body

### GET /api/admin/messages
**Description:** Get messages
**Request:** No body

### GET /api/admin/allRoleSpecificUsers/all
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
    "grade": "10A",
    "subjects": ["Math", "Physics"],
    "parentId": "parent123"
  }
]
```

### GET /api/admin/allRoleSpecificUsers/{role}
**Description:** Get users filtered by role (Teacher, Student, Parent)
**Request:** No body

### POST /api/admin/users
**Description:** Create a new user
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "0761234567",
  "role": "Student",
  "grade": "10A",
  "subjects": ["Mathematics", "Physics"],
  "parentId": "parent123"
}
```

### PATCH /api/admin/users/{userId}
**Description:** Update an existing user
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phoneNumber": "0987654321",
  "grade": "11A",
  "subjects": ["Chemistry", "Biology"]
}
```

### DELETE /api/admin/users/{userId}
**Description:** Delete a user
**Request:** No body
**Response:** 204 No Content

### GET /api/attendance/submissions
**Description:** Get attendance submissions for review
**Request:** No body

### PUT /api/attendance/submissions/{submissionId}
**Description:** Update attendance submission status
**Request Body:**
```json
{
  "status": "Approved",
  "comments": "Attendance approved"
}
```

---

## 👨‍🏫 TEACHER ENDPOINTS

### GET /api/teacher/students
**Description:** Get teacher's assigned students
**Request:** No body

### GET /api/teacher/resources
**Description:** Get all teacher resources
**Request:** No body

### POST /api/teacher/resources/upload
**Description:** Upload a new resource
**Content-Type:** multipart/form-data
**Request Body:**
```
file: [File object]
classId: "class123"
description: "Homework assignment for Chapter 1"
```

### DELETE /api/teacher/resources/{resourceId}
**Description:** Delete a resource
**Request:** No body

### GET /api/teacher/classes
**Description:** Get teacher's classes
**Request:** No body

### GET /api/teacher/classes/{classId}/attendance
**Description:** Get class details for attendance taking
**Request:** No body

### GET /api/teacher/classes/{classId}/attendance/{date}
**Description:** Get attendance for specific date
**Request:** No body

### POST /api/teacher/attendance
**Description:** Submit class attendance
**Request Body:**
```json
{
  "classId": "class123",
  "date": "2023-10-27",
  "attendanceType": "full_day",
  "schoolId": "school123",
  "students": [
    {
      "studentId": "student123",
      "isPresent": true
    }
  ]
}
```

### GET /api/teacher/students/{studentId}/reports
**Description:** Get reports for a specific student
**Request:** No body

### POST /api/teacher/students/{studentId}/reports
**Description:** Upload a report for a student
**Content-Type:** multipart/form-data

---

## 🎓 STUDENT ENDPOINTS

### GET /api/student/{phoneNumber}
**Description:** Get student details by phone number
**Request:** No body

### PUT /api/student/updateStudent
**Description:** Update student information
**Request Body:**
```json
{
  "id": "student123",
  "name": "John Doe",
  "lastName": "Doe",
  "grade": "10A",
  "phoneNumber": "0761234567",
  "email": "john@example.com"
}
```

### GET /api/student/{studentId}/reports
**Description:** Get student's own reports
**Request:** No body

### GET /api/student/attendance
**Description:** Get student's attendance records
**Query Parameters:** `month`, `year`, `startDate`, `endDate`
**Request:** No body

### GET /api/student/resources
**Description:** Get available resources
**Query Parameters:** `subject`, `searchTerm`
**Request:** No body

### GET /api/student/resources/{resourceId}/download
**Description:** Download a resource file
**Request:** No body
**Response:** File blob

### GET /api/student/reports
**Description:** Get student's academic reports
**Query Parameters:** `term`, `subject`
**Request:** No body

### GET /api/student/reports/{reportId}/download
**Description:** Download a report file
**Request:** No body
**Response:** File blob

---

## 👨‍👩‍👧‍👦 PARENT ENDPOINTS

### GET /api/parent/children
**Description:** Get parent's children
**Request:** No body

### GET /api/parent/children/{childId}/dashboard
**Description:** Get dashboard data for a specific child
**Request:** No body

### GET /api/parent/children/{childId}/attendance
**Description:** Get child's attendance records
**Query Parameters:** `month`, `year`
**Request:** No body

### GET /api/parent/children/{childId}/reports
**Description:** Get child's reports
**Request:** No body

### GET /api/parent/reports/{reportId}/download
**Description:** Download a report
**Request:** No body
**Response:** File blob

---

## 📊 REPORT ENDPOINTS

### POST /api/reports/student/upload
**Description:** Upload a student report
**Content-Type:** multipart/form-data

### GET /api/reports/student/{studentId}
**Description:** Get reports for a student
**Request:** No body

### GET /api/reports/class/{classId}
**Description:** Get reports for a class
**Request:** No body

### PUT /api/reports/{reportId}
**Description:** Update a report
**Request:** No body

### DELETE /api/reports/{reportId}
**Description:** Delete a report
**Request:** No body

### GET /api/reports/{reportId}/download
**Description:** Download a report file
**Request:** No body
**Response:** File blob

### GET /api/reports/terms
**Description:** Get available academic terms
**Request:** No body

### POST /api/reports/attendance/download
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

### POST /api/reports/academic/download
**Description:** Download academic report
**Request Body:**
```json
{
  "term": "Term 1 2024",
  "format": "pdf"
}
```
**Response:** File blob

---

## 📅 CALENDAR ENDPOINTS

### GET /api/calendar
**Description:** Get calendar events
**Query Parameters:** `startDate`, `endDate` (YYYY-MM-DD format)
**Request:** No body

### POST /api/calendar
**Description:** Create a new event
**Request Body:**
```json
{
  "title": "School Sports Day",
  "start": "2023-12-01T08:00:00Z",
  "end": "2023-12-01T16:00:00Z",
  "type": "sports",
  "description": "Annual sports day event"
}
```

### PUT /api/calendar/{eventId}
**Description:** Update an event
**Request:** No body

### DELETE /api/calendar/{eventId}
**Description:** Delete an event
**Request:** No body

### GET /api/calendar/event-types
**Description:** Get available event types
**Request:** No body

---

## 📢 ANNOUNCEMENT ENDPOINTS

### GET /api/announcements
**Description:** Get announcements
**Query Parameters:** `limit`, `type`
**Request:** No body

### POST /api/announcements
**Description:** Create an announcement
**Request Body:**
```json
{
  "title": "New Announcement",
  "content": "This is the announcement content",
  "type": "general",
  "priority": "medium",
  "targetAudience": ["students", "parents"]
}
```

---

## 📊 ATTENDANCE ENDPOINTS

### GET /api/attendance/student
**Description:** Get student attendance records
**Query Parameters:** `studentId`, `startDate`, `endDate`
**Request:** No body

### GET /api/attendance/student/{studentId}/stats
**Description:** Get attendance statistics for a student
**Request:** No body

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

---

## 🚀 DEPLOYMENT NOTES

1. **Environment Variables Required:**
   - `REACT_APP_API_URL`: Backend API base URL
   - Firebase configuration variables

2. **CORS Configuration:**
   - Allow frontend domain
   - Include credentials for authentication

3. **Authentication:**
   - JWT token implementation
   - Firebase Admin SDK for OTP verification
   - Role-based access control with level/province support

4. **Province-Based Access Control:**
   - Master users: National access with province filtering
   - Provincial superadmins: Locked to assigned province
   - Regular users: School-scoped access
