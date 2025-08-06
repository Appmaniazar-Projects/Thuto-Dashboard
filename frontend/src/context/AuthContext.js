import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  twitterProvider 
} from '../services/firebase';
import { useSnackbar } from 'notistack';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Set up auth state observer and unsubscribe on unmount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signup = async (email, password, additionalData = {}) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with additional data if provided
      if (additionalData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: additionalData.displayName
        });
        
        // Update current user with the new display name
        setCurrentUser({
          ...userCredential.user,
          displayName: additionalData.displayName
        });
      }
      
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      return userCredential.user;
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
      enqueueSnackbar('Logged in successfully!', { variant: 'success' });
      return userCredential.user;
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message);
      enqueueSnackbar('Invalid email or password', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        enqueueSnackbar('Logged in with Google!', { variant: 'success' });
        return result.user;
      })
      .catch((error) => {
        console.error('Google Sign In Error:', error);
        setError(error.message);
        enqueueSnackbar('Failed to sign in with Google', { variant: 'error' });
        throw error;
      });
  };

  // Login with Facebook
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        enqueueSnackbar('Logged in with Facebook!', { variant: 'success' });
        return result.user;
      })
      .catch((error) => {
        console.error('Facebook Sign In Error:', error);
        setError(error.message);
        enqueueSnackbar('Failed to sign in with Facebook', { variant: 'error' });
        throw error;
      });
  };

  // Login with Twitter
  const loginWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    return signInWithPopup(auth, provider)
      .then((result) => {
        enqueueSnackbar('Logged in with Twitter!', { variant: 'success' });
        return result.user;
      })
      .catch((error) => {
        console.error('Twitter Sign In Error:', error);
        setError(error.message);
        enqueueSnackbar('Failed to sign in with Twitter', { variant: 'error' });
        throw error;
      });
  };

  // Reset password (send reset email)
  const resetPassword = async (email) => {
    try {
      setError('');
      setLoading(true);
      await firebaseSendPasswordResetEmail(auth, email);
      enqueueSnackbar('Password reset email sent. Please check your inbox.', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Password Reset Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to send password reset email', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (oobCode, newPassword) => {
    try {
      setError('');
      setLoading(true);
      // Note: This requires Firebase Admin SDK on the backend
      // For client-side only, we would use the oobCode directly with Firebase Auth
      await auth.confirmPasswordReset(oobCode, newPassword);
      enqueueSnackbar('Your password has been reset successfully!', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Password Reset Confirmation Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to reset password', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setCurrentUser(null);
      enqueueSnackbar('Logged out successfully!', { variant: 'info' });
    } catch (err) {
      console.error('Logout Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to log out', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError('');
      setLoading(true);
      await updateProfile(auth.currentUser, updates);
      
      // Update current user in state
      setCurrentUser({
        ...currentUser,
        ...updates
      });
      
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Update Profile Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Manually set user (useful for OTP/test mode)
  const setUser = (userData) => {
    if (userData) {
      setCurrentUser({
        ...userData,
        id: userData.id,
        email: userData.email,
        role: userData.role?.toLowerCase() || 'student',
        displayName: userData.name || userData.displayName || 'User',
        phoneNumber: userData.phoneNumber
      });
    } else {
      setCurrentUser(null);
    }
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    resetPassword,
    logout,
    updateUserProfile,
    setUser,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };

export default AuthContext;