import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (!currentUser) return;
    setFormData({
      name: currentUser.name || currentUser.displayName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || ''
    });
  }, [currentUser]);

  const handleInputChange = (key) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const handleSave = async () => {
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
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Settings</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Settings</h2>
      <p>Basics</p>

      {saveError ? (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {saveError}
        </div>
      ) : null}

      <div className="detail-grid" style={{ maxWidth: 720 }}>
        <div className="detail-item">
          <strong>First Name:</strong>
          <input type="text" value={formData.name} onChange={handleInputChange('name')} />
        </div>
        <div className="detail-item">
          <strong>Last Name:</strong>
          <input type="text" value={formData.lastName} onChange={handleInputChange('lastName')} />
        </div>
        <div className="detail-item">
          <strong>Email:</strong>
          <input type="email" value={formData.email} onChange={handleInputChange('email')} />
        </div>
        <div className="detail-item">
          <strong>Phone:</strong>
          <input type="tel" value={formData.phoneNumber} onChange={handleInputChange('phoneNumber')} />
        </div>
        <div className="detail-item">
          <strong>Role:</strong>
          <span>{String(currentUser.role || 'N/A').toUpperCase()}</span>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave} disabled={isSaving} className="edit-profile-btn">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;