# Teacher API Endpoints

This document outlines the API endpoints required for the Teacher role in the Thuto Dashboard. All endpoints are prefixed with `/api`.

## Authentication

All endpoints require a valid JWT token for an authenticated user with the `TEACHER` role, sent in the `Authorization` header.

---

## Dashboard

### 1. Get Teacher's Classes

- **Endpoint**: `GET /teacher/classes`
- **Description**: Fetches a list of all classes assigned to the currently logged-in teacher.
- **Used In**: Teacher Dashboard to display the "Today's Classes" list.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "cls-101",
      "name": "Mathematics - Grade 10A",
      "period": "9:00 AM - 10:00 AM",
      "students": 30
    },
    {
      "id": "cls-102",
      "name": "Physics - Grade 11B",
      "period": "10:15 AM - 11:15 AM",
      "students": 25
    }
  ]
  ```

### 2. Get Recent Resources

- **Endpoint**: `GET /teacher/resources/recent`
- **Description**: Fetches a list of the most recently uploaded resources by the teacher.
- **Query Parameters**:
  - `limit` (number, optional): The maximum number of resources to return. Defaults to 5.
- **Used In**: Teacher Dashboard to display the "Recent Resources" card.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "res-001",
      "fileName": "Chapter 1 Notes.pdf",
      "uploadDate": "2023-10-27T10:00:00Z",
      "fileUrl": "https://your-storage-provider.com/path/to/file1.pdf"
    },
    {
      "id": "res-002",
      "fileName": "Homework 5.docx",
      "uploadDate": "2023-10-26T15:30:00Z",
      "fileUrl": "https://your-storage-provider.com/path/to/file2.docx"
    }
  ]
  ```

---

## Students & Reports

### 1. Get Teacher's Students

- **Endpoint**: `GET /teacher/students`
- **Description**: Fetches a list of all students in the teacher's classes.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "stu-001",
      "name": "John Doe",
      "grade": "10A"
    }
  ]
  ```

### 2. Get Student's Academic Reports

- **Endpoint**: `GET /teacher/students/{studentId}/reports`
- **Description**: Fetches all academic reports for a specific student.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "rep-001",
      "description": "Term 1 Report",
      "uploadDate": "2023-04-15T00:00:00Z",
      "fileUrl": "..."
    }
  ]
  ```

### 3. Upload a Student Report

- **Endpoint**: `POST /teacher/students/{studentId}/reports`
- **Description**: Uploads a new academic report for a student.
- **Request**: `multipart/form-data`
  - `file`: The report file.
  - `description`: A string describing the report.
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Report uploaded successfully!",
    "reportId": "rep-002"
  }
  ```

---

## Resources

### 1. Get All Teacher Resources

- **Endpoint**: `GET /teacher/resources`
- **Description**: Fetches all resources uploaded by the teacher.
- **Success Response (200 OK)**: Returns an array of resource objects (see `GET /teacher/resources/recent` for structure).

### 2. Upload a New Resource

- **Endpoint**: `POST /teacher/resources/upload`
- **Description**: Uploads a new resource for a specific class.
- **Request**: `multipart/form-data`
  - `file`: The resource file.
  - `classId`: The ID of the class the resource is for.
  - `description` (optional): A description of the resource.
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Resource uploaded successfully!",
    "resourceId": "res-003"
  }
  ```

### 3. Delete a Resource

- **Endpoint**: `DELETE /teacher/resources/{resourceId}`
- **Description**: Deletes a specific resource.
- **Success Response (204 No Content)**

---

## Attendance

### 1. Get Class Details for Attendance

- **Endpoint**: `GET /teacher/classes/{classId}/attendance`
- **Description**: Fetches the details of a class, including its student roster, to prepare for taking attendance.
- **Success Response (200 OK)**:
  ```json
  {
    "classId": "cls-101",
    "className": "Mathematics - Grade 10A",
    "students": [
      { "studentId": "stu-001", "name": "John Doe" },
      { "studentId": "stu-002", "name": "Jane Smith" }
    ]
  }
  ```

### 2. Get Attendance for a Specific Date

- **Endpoint**: `GET /teacher/classes/{classId}/attendance/{date}`
- **Description**: Fetches the recorded attendance for a class on a specific date.
- **URL Parameters**:
  - `date`: The date in `YYYY-MM-DD` format.
- **Success Response (200 OK)**:
  ```json
  {
    "classId": "cls-101",
    "date": "2023-10-27",
    "attendance": [
      { "studentId": "stu-001", "isPresent": true },
      { "studentId": "stu-002", "isPresent": false }
    ]
  }
  ```

### 3. Submit Class Attendance

- **Endpoint**: `POST /teacher/attendance`
- **Description**: Submits attendance records for a class.
- **Request Body**:
  ```json
  {
    "classId": "cls-101",
    "date": "2023-10-27",
    "attendanceType": "full_day", // e.g., 'full_day', 'morning', 'afternoon'
    "students": [
      { "studentId": "stu-001", "isPresent": true },
      { "studentId": "stu-002", "isPresent": false }
    ]
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Attendance submitted successfully."
  }
  ```

### 4. Get Attendance History

- **Endpoint**: `GET /teacher/classes/{classId}/attendance/history`
- **Description**: Fetches the attendance history for a class, with optional date filtering.
- **Query Parameters**:
  - `startDate` (string, optional): Start date in `YYYY-MM-DD` format.
  - `endDate` (string, optional): End date in `YYYY-MM-DD` format.
- **Success Response (200 OK)**: Returns a list of attendance records.
  ```json
  [
    {
      "date": "2023-10-27",
      "presentCount": 28,
      "absentCount": 2
    },
    {
      "date": "2023-10-26",
      "presentCount": 30,
      "absentCount": 0
    }
  ]
  ```
