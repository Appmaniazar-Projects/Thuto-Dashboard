import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const user = currentUser;

  const displayRole = useMemo(() => {
    if (!user?.role) return 'N/A';
    return String(user.role).toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || user.displayName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    });
  }, [user]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  const handleInputChange = (key) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const handleSaveAccount = async () => {
    try {
      setSaveError('');
      setIsSaving(true);

      const updates = {
        name: formData.name?.trim() || null,
        lastName: formData.lastName?.trim() || null,
        email: formData.email?.trim() || null,
        phoneNumber: formData.phoneNumber?.trim() || null
      };

      Object.keys(updates).forEach((k) => {
        if (updates[k] === null) delete updates[k];
      });

      await updateUserProfile(updates);
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="avatar-section">
          <div className="avatar-placeholder-large"></div>
          <h3>{user.name || user.displayName || 'N/A'} {user.lastName || ''}</h3>
          <p>{displayRole}</p>
        </div>
        <div className="profile-navigation">
          <button
            type="button"
            className={activeSection === 'account' ? 'active' : ''}
            onClick={() => setActiveSection('account')}
          >
            Account
          </button>
          <button
            type="button"
            className={activeSection === 'security' ? 'active' : ''}
            onClick={() => setActiveSection('security')}
          >
            Security
          </button>
          <button
            type="button"
            className={activeSection === 'notification' ? 'active' : ''}
            onClick={() => setActiveSection('settings')}
          >
            Notifications
          </button>
        </div>
      </div>
      <div className="profile-main-content">
        {activeSection === 'account' && (
          <div className="content-card">
            <h4>Account Details</h4>

            {saveError ? (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {saveError}
              </div>
            ) : null}

            <div className="detail-grid">
              <div className="detail-item">
                <strong>First Name:</strong>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                />
              </div>
              <div className="detail-item">
                <strong>Last Name:</strong>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                />
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                />
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                />
              </div>
              <div className="detail-item">
                <strong>Role:</strong>
                <span>{displayRole}</span>
              </div>
              <div className="detail-item">
                <strong>School:</strong>
                <span>{user.school?.name || 'N/A'}</span>
              </div>
            </div>

            <div className="content-actions">
              <button
                className="edit-profile-btn"
                onClick={handleSaveAccount}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="content-card">
            <h4>Security</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Account Email:</strong>
                <span>{user.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <strong>Password:</strong>
                <span>Managed by your authentication method</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notification' && (
          <div className="content-card">
            <h4>Notifications</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Notifications:</strong>
                <span>Coming soon</span>
              </div>
              <div className="detail-item">
                <strong>Theme:</strong>
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;