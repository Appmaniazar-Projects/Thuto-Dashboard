# Super Admin API Endpoints

This document outlines the API endpoints required for the **Super Admin** role in the Thuto Dashboard. These endpoints are for managing schools, administrators, and system-wide settings.

All endpoints are prefixed with `/api` and require a valid JWT token for an authenticated user with the `SUPER_ADMIN` role.

---

## School Management

### 1. Get All Schools

- **Endpoint**: `GET /superadmin/schools`
- **Description**: Fetches a list of all schools in the system.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "sch-001",
      "name": "Greenwood High",
      "location": "Springfield",
      "adminCount": 3,
      "userCount": 540
    }
  ]
  ```

### 2. Create a New School

- **Endpoint**: `POST /superadmin/schools`
- **Description**: Creates a new school.
- **Request Body**:
  ```json
  {
    "name": "Northwood Academy",
    "location": "Northwood City",
    "contactEmail": "contact@northwood.edu"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "School created successfully",
    "schoolId": "sch-002"
  }
  ```

### 3. Update a School

- **Endpoint**: `PUT /superadmin/schools/{schoolId}`
- **Description**: Updates an existing school's information.
- **Request Body**: An object with the fields to update.
- **Success Response (200 OK)**: Returns the updated school object.

### 4. Delete a School

- **Endpoint**: `DELETE /superadmin/schools/{schoolId}`
- **Description**: Deletes a school from the system. This should be a soft delete or require confirmation.
- **Success Response (204 No Content)**

### 5. Get School Details

- **Endpoint**: `GET /superadmin/schools/{schoolId}/details`
- **Description**: Fetches detailed information about a specific school, including user counts and assigned administrators.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "sch-001",
    "name": "Greenwood High",
    "location": "Springfield",
    "stats": {
      "admins": 3,
      "teachers": 45,
      "students": 450,
      "parents": 200
    },
    "administrators": [ ... ] // List of admin users
  }
  ```

### 6. Bulk Create Schools via CSV

- **Endpoint**: `POST /superadmin/schools/bulk`
- **Description**: Creates multiple schools at once from a CSV file.
- **Request**: `multipart/form-data` with a `file` field.
- **Success Response (200 OK)**: A summary of created schools and any errors.

---

## Administrator Management

### 1. Get All Administrators

- **Endpoint**: `GET /superadmin/admins`
- **Description**: Fetches a list of all administrators across all schools.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "admin-001",
      "name": "Alice Johnson",
      "email": "alice.j@greenwood.edu",
      "schoolName": "Greenwood High",
      "schoolId": "sch-001"
    }
  ]
  ```

### 2. Get Administrators by School

- **Endpoint**: `GET /superadmin/schools/{schoolId}/admins`
- **Description**: Fetches all administrators for a specific school.
- **Success Response (200 OK)**: Returns a list of admin user objects.

### 3. Create a New Administrator

- **Endpoint**: `POST /superadmin/admins`
- **Description**: Creates a new administrator and assigns them to a school.
- **Request Body**:
  ```json
  {
    "name": "Bob Williams",
    "email": "bob.w@northwood.edu",
    "password": "strongpassword123",
    "schoolId": "sch-002"
  }
  ```
- **Success Response (201 Created)**: Returns the new administrator's ID.

### 4. Update an Administrator

- **Endpoint**: `PUT /superadmin/admins/{adminId}`
- **Description**: Updates an administrator's details (e.g., name, email, school assignment).
- **Request Body**: An object with fields to update.
- **Success Response (200 OK)**: Returns the updated administrator object.

### 5. Delete an Administrator

- **Endpoint**: `DELETE /superadmin/admins/{adminId}`
- **Description**: Deletes an administrator.
- **Success Response (204 No Content)**

### 6. Bulk Create Administrators via CSV

- **Endpoint**: `POST /superadmin/admins/bulk`
- **Description**: Creates multiple administrators from a CSV file.
- **Request**: `multipart/form-data` with a `file` field.
- **Success Response (200 OK)**: A summary of created admins and any errors.

---

## System Statistics & Analytics

### 1. Get System-Wide Statistics

- **Endpoint**: `GET /superadmin/stats`
- **Description**: Fetches high-level statistics for the entire platform.
- **Success Response (200 OK)**:
  ```json
  {
    "totalSchools": 15,
    "totalUsers": 8500,
    "totalAdmins": 45,
    "totalTeachers": 600
  }
  ```

### 2. Get Platform Analytics

- **Endpoint**: `GET /superadmin/analytics`
- **Description**: Fetches detailed analytics data for platform usage, growth, etc.
- **Success Response (200 OK)**: The structure will depend on the analytics being tracked. Could include time-series data for user sign-ups, feature usage, etc.
