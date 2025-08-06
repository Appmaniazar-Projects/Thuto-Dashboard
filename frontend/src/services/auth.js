import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL; // Set this in your .env file

export async function loginWithFirebase(user) {
  const idToken = await user.getIdToken();
  const response = await axios.post(`${API_BASE}/auth/login`, {
    idToken,
  });
  return response.data; // { user, token }
}