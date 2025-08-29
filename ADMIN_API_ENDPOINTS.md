# Admin API Endpoints

This document outlines the API endpoints available for the Admin role in the Thuto Dashboard.

## 1. User Management

### Get All Users

- **Endpoint**: `GET /admin/users`
- **Description**: Retrieves a list of all users. Can be filtered by role.
- **Query Parameters**:
  - `role` (optional): Filter users by role (e.g., `teacher`, `student`).
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student"
    }
  ]
  ```

### Create User

- **Endpoint**: `POST /admin/users`
- **Description**: Creates a new user (student, parent, etc.).
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "student",
    "password": "strongpassword123"
  }
  ```

### Update User

- **Endpoint**: `PUT /admin/users/{userId}`
- **Description**: Updates an existing user's information.

### Delete User

- **Endpoint**: `DELETE /admin/users/{userId}`
- **Description**: Deletes a user from the system.

### Create Administrator

- **Endpoint**: `POST /admin/admins`
- **Description**: Creates a new user with the 'admin' role.

### Create Teacher

- **Endpoint**: `POST /admin/teachers`
- **Description**: Creates a new user with the 'teacher' role.

### Bulk Create Users

- **Endpoint**: `POST /admin/users/bulk`
- **Description**: Creates multiple users from a CSV file.
- **Request Body**: `multipart/form-data` with a CSV file.

### Reset a User's Password

- **Endpoint**: `PUT /admin/users/{userId}/reset-password`
- **Description**: Resets the password for a specific user.

## 2. Dashboard Statistics

### Get User Statistics

- **Endpoint**: `GET /admin/users/stats`
- **Description**: Retrieves statistics for the admin dashboard, such as total number of users by role.
- **Success Response (200 OK)**:
  ```json
  {
    "totalUsers": 500,
    "totalStudents": 350,
    "totalTeachers": 50,
    "totalAdmins": 5
  }
  ```

## 3. Attendance Management

### Get Attendance Submissions

- **Endpoint**: `GET /admin/attendance/submissions`
- **Description**: Retrieves all attendance submissions from teachers for review.

### Update Attendance Submission

- **Endpoint**: `PUT /admin/attendance/submissions/{submissionId}`
- **Description**: Approves or rejects an attendance submission.

## 4. Reports

### Generate Enrollment Report

- **Endpoint**: `POST /admin/reports/enrollment`
- **Description**: Generates a report with enrollment statistics.
- **Note**: This is the only admin report endpoint currently in use.
