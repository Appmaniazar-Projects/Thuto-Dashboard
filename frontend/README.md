# Thuto Dashboard - Frontend

React-based frontend for the Thuto Dashboard educational management system.

## 🔐 Authentication System - PHONE OTP ONLY

**CRITICAL: This frontend implements ONLY phone-based OTP authentication using Firebase. NO third-party social login options (Google, Facebook, Twitter) are supported.**

### Supported Login Methods

1. **Students & Parents**: Phone number + Firebase OTP **ONLY**
2. **Teachers**: Phone number + Firebase OTP **ONLY**
3. **School Admins**: Email + password (backend verification)
4. **Super Admins**: Email + password (backend verification)

**NO Google, Facebook, Twitter, or any other social login is implemented.**

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16 or higher
- Firebase project with **Phone Authentication ONLY** enabled
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure Firebase credentials in `.env` (Phone Auth ONLY):
   ```env
   # Firebase Configuration (Phone Authentication ONLY)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   REACT_APP_FIREBASE_APP_ID=your_app_id_here
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

   # Backend API
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   ```

### Firebase Setup Requirements - PHONE ONLY

Your Firebase project must have:

1. **Phone Authentication enabled** in Firebase Console (NO other providers)
2. **NO Google, Facebook, Twitter providers** enabled
3. **Test phone numbers configured** (optional, for development)
4. **Authorized domains** configured for your deployment
5. **reCAPTCHA verification** enabled (uses invisible reCAPTCHA)

### Running the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🏗️ Architecture

### Key Components

- **Authentication**: Firebase phone OTP integration **ONLY**
- **Routing**: Role-based protected routes
- **State Management**: React Context for auth and app state
- **UI Framework**: Material-UI components
- **API Communication**: Axios-based services

### Authentication Flow - PHONE OTP ONLY

```
1. User enters phone number
2. Firebase sends OTP via SMS
3. User enters OTP code
4. Firebase verifies OTP
5. Frontend sends Firebase token to backend
6. Backend verifies Firebase token and returns JWT
7. JWT stored for subsequent API calls
```

### Project Structure

```
src/
├── components/
│   ├── auth/              # Login components (phone OTP only)
│   ├── admin/             # Admin dashboard
│   ├── student/           # Student dashboard
│   ├── parent/            # Parent dashboard
│   ├── teacher/           # Teacher dashboard
│   ├── superadmin/        # Super admin dashboard
│   └── common/            # Reusable components
├── services/
│   ├── firebase.js        # Firebase phone auth config (NO social providers)
│   ├── auth.js            # Phone OTP authentication service
│   ├── api.js             # API client configuration
│   └── [role]Service.js   # Role-specific API services
├── context/               # React contexts
├── config/                # App configuration
└── assets/                # Static assets
```

## 🔧 Backend Integration

### Required Backend Endpoints

The frontend expects these authentication endpoints:

```
POST /api/auth/verify-otp
- Verifies Firebase phone token and returns JWT
- Body: { phoneNumber, firebaseUid, firebaseToken }

POST /api/auth/admin/login  
- Admin email/password login
- Body: { email, password }

POST /api/auth/superadmin/login
- Super admin email/password login  
- Body: { email, password }
```

**DO NOT implement social login endpoints (Google, Facebook, Twitter).**

### API Services

Each role has dedicated service files:
- `adminService.js` - School admin operations
- `superAdminService.js` - Super admin operations  
- `studentService.js` - Student operations
- `parentService.js` - Parent operations
- `teacherService.js` - Teacher operations

## 🛠️ Development

### Available Scripts

- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Environment Variables

All environment variables must be prefixed with `REACT_APP_` to be accessible in the React application.

### Authentication Testing

For development, you can configure test phone numbers in Firebase Console to bypass SMS sending.

## 🔒 Security Notes - NO SOCIAL LOGIN

- Uses Firebase invisible reCAPTCHA for bot protection
- JWT tokens stored in localStorage
- Role-based route protection
- **NO third-party social authentication** (Google, Facebook, Twitter)
- Phone number validation and formatting
- Automatic logout on token expiration

## 📱 Supported Features

### Multi-Role Dashboard
- Student: Subjects, attendance, reports, resources
- Parent: Children's attendance, reports  
- Teacher: Class management, attendance, resources
- Admin: User management, school statistics
- Super Admin: Multi-school management

### Common Features
- Responsive design
- Loading states and error handling
- Notification system
- Protected routing
- Dynamic theming support

## ⚠️ IMPORTANT - NO THIRD-PARTY LOGIN

This system is designed to use **ONLY phone-based OTP authentication**. Do not attempt to add Google, Facebook, Twitter, or any other social login providers. The `firebase.js` configuration file has been specifically configured to exclude all social authentication providers.
