import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Profile</h2>
      <div>
        <strong>Name:</strong> {user.name || user.displayName || 'N/A'}
      </div>
      <div>
        <strong>Email:</strong> {user.email || 'N/A'}
      </div>
      {/* Add more user info fields as needed */}
      <div style={{ marginTop: '1rem' }}>
        <button disabled>Edit Profile (Coming Soon)</button>
      </div>
    </div>
  );
};

export default ProfilePage; 