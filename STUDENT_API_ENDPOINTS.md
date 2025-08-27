# Student Role API Endpoints

This document outlines the required backend API endpoints to support the student-facing features of the Thuto Dashboard. All endpoints are prefixed with `/api` and require authentication.

---

## 1. Dashboard

### Get Dashboard Data

- **Method:** `GET`
- **Path:** `/students/dashboard`
- **Description:** Fetches all the necessary data for the student's main dashboard view.
- **Response Body:**
  ```json
  {
    "stats": {
      "newResources": Number,
      "upcomingEvents": Number,
      "unreadMessages": Number,
      "assignmentsDue": Number
    },
    "resources": [
      {
        "id": String,
        "name": String,
        "subject": String
      }
    ],
    "announcements": [
      {
        "id": String,
        "title": String,
        "category": String,
        "isNew": Boolean
      }
    ],
    "attendance": {
      "present": [Number], // Array of dates of the month
      "absent": [Number],
      "holiday": [Number]
    }
  }
  ```

---

## 2. Subjects/Courses

### Get Enrolled Subjects

- **Method:** `GET`
- **Path:** `/students/subjects`
- **Description:** Retrieves a list of all subjects the student is currently enrolled in.
- **Response Body:**
  ```json
  [
    {
      "id": String,
      "name": String,
      "code": String,
      "teacher": String,
      "room": String,
      "description": String
    }
  ]
  ```

---

## 3. Resources

### Get All Resources

- **Method:** `GET`
- **Path:** `/students/resources`
- **Description:** Fetches a list of all available learning resources, with optional filtering.
- **Query Parameters:** `subject` (String), `searchTerm` (String)
- **Response Body:**
  ```json
  [
    {
      "id": String,
      "title": String,
      "subject": String,
      "description": String,
      "uploadDate": "YYYY-MM-DDTHH:mm:ssZ",
      "fileName": String
    }
  ]
  ```

### Get a Single Resource (for download)

- **Method:** `GET`
- **Path:** `/students/resources/:resourceId`
- **Description:** Retrieves a single resource file for downloading.
- **Response:** The raw file data (e.g., `application/pdf`).

---

## 4. Attendance

### Get Monthly Attendance

- **Method:** `GET`
- **Path:** `/students/attendance`
- **Description:** Fetches the student's attendance records for a specific month.
- **Query Parameters:** `month` (String, format: `YYYY-MM`)
- **Response Body:**
  ```json
  {
    "summary": {
      "presentDays": Number,
      "absentDays": Number,
      "attendanceRate": Number // Percentage (0-100)
    },
    "details": [
      {
        "id": String,
        "date": "YYYY-MM-DDTHH:mm:ssZ",
        "status": "Present" | "Absent",
        "subject": String,
        "teacher": String,
        "remarks": String
      }
    ]
  }
  ```

---

## 5. Academic Reports

### Get All Reports

- **Method:** `GET`
- **Path:** `/students/reports`
- **Description:** Retrieves a list of all academic reports available for the student.
- **Response Body:**
  ```json
  [
    {
      "id": String,
      "title": String,
      "type": String, // e.g., 'Term 1', 'Final'
      "issueDate": "YYYY-MM-DDTHH:mm:ssZ",
      "teacher": String,
      "comments": String,
      "fileName": String
    }
  ]
  ```

### Get a Single Report (for download)

- **Method:** `GET`
- **Path:** `/students/reports/:reportId`
- **Description:** Retrieves a single report file for downloading.
- **Response:** The raw file data (e.g., `application/pdf`).
