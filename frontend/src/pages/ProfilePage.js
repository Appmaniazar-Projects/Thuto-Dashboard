import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
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

  const handleCancelEditAccount = () => {
    setSaveError('');
    setIsEditingAccount(false);
    setFormData({
      name: user.name || user.displayName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || ''
    });
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
      setIsEditingAccount(false);
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
          <a
            href="#account"
            className={activeSection === 'account' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('account');
            }}
          >
            Account
          </a>
          <a
            href="#security"
            className={activeSection === 'security' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('security');
            }}
          >
            Security
          </a>
          <a
            href="#notifications"
            className={activeSection === 'notifications' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('notifications');
            }}
          >
            Notifications
          </a>
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
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
                  />
                ) : (
                  <span>{user.name || user.displayName || 'N/A'}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Last Name:</strong>
                {isEditingAccount ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
                  />
                ) : (
                  <span>{user.lastName || 'N/A'}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                {isEditingAccount ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
                  />
                ) : (
                  <span>{user.email || 'N/A'}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                {isEditingAccount ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
                  />
                ) : (
                  <span>{user.phoneNumber || 'N/A'}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Role:</strong>
                <span>{displayRole}</span>
              </div>
              <div className="detail-item">
                <strong>School:</strong>
                <span>{
                  user.school?.name || 
                  user.schoolName || 
                  user.school?.schoolName ||
                  (typeof user.school === 'string' ? user.school : null) ||
                  'N/A'
                }</span>
              </div>
            </div>

            <div className="content-actions">
              {!isEditingAccount ? (
                <button
                  className="edit-profile-btn"
                  onClick={() => setIsEditingAccount(true)}
                  disabled={isSaving}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="edit-profile-btn"
                    onClick={handleSaveAccount}
                    disabled={isSaving}
                    style={{ marginRight: 8 }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="edit-profile-btn"
                    onClick={handleCancelEditAccount}
                    disabled={isSaving}
                    style={{ backgroundColor: '#6c757d' }}
                  >
                    Cancel
                  </button>
                </>
              )}
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

        {activeSection === 'notifications' && (
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