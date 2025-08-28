# Parent Role API Endpoints

This document outlines the required backend API endpoints to support the parent-facing features of the Thuto Dashboard. All endpoints are prefixed with `/api` and require authentication.

---

## 1. Children

### Get My Children

- **Method:** `GET`
- **Path:** `/parent/children`
- **Description:** Fetches a list of children associated with the logged-in parent.
- **Response Body:**
  ```json
  [
    {
      "id": "String",
      "name": "String",
      "grade": "String",
      "school": "String"
    }
  ]
  ```

---

## 2. Dashboard

### Get Child's Dashboard Data

- **Method:** `GET`
- **Path:** `/parent/dashboard/:childId`
- **Description:** Fetches all the necessary data for the parent's dashboard view for a specific child.
- **Response Body:**
  ```json
  {
    "stats": {
      "attendance": "String", // e.g., "98%"
      "feesDue": "String" // e.g., "R1500"
    },
    "announcements": [
      {
        "id": "String",
        "from": "String",
        "title": "String"
      }
    ]
  }
  ```
