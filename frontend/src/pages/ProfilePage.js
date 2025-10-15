import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../App.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="avatar-section">
          <div className="avatar-placeholder-large"></div>
          <h3>{user.name || user.displayName || 'N/A'} {user.lastName || ''}</h3>
          <p>{user.role || 'N/A'}</p>
        </div>
        <div className="profile-navigation">
          <a href="#account" className="active">Account</a>
          <a href="#security">Security</a>
          <a href="#notifications">Notifications</a>
        </div>
      </div>
      <div className="profile-main-content">
        <div className="content-card">
          <h4>Account Details</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>First Name:</strong>
              <span>{user.name || user.displayName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>Last Name:</strong>
              <span>{user.lastName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>School:</strong>
              <span>{user.school?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>Member Since:</strong>
              <span>{'January 2024'}</span>
            </div>
          </div>
          <div className="content-actions">
            <button className="edit-profile-btn" disabled>Update Profile (Coming Soon)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;