/**
 * Parent activation flow (one-time OTP verification -> set permanent
 * username/password).
 *
 * Deliberately identifies the parent by verified phone number rather than
 * a URL token - a token in a query string ends up in server access logs,
 * browser history, and can leak via the Referer header. The approval
 * notification can link straight to a plain /otp URL with no query
 * string at all.
 *
 * *** ENDPOINT SHAPE BELOW IS ASSUMED, NOT CONFIRMED WITH THE BACKEND ***
 * Per the Sept 21 meeting notes, this whole flow depends on Siya confirming
 * the "verify OTP, then set username/password" endpoint's exact shape, and
 * specifically here: whether a verified phone number is enough on its own
 * to uniquely identify the pending-approval parent record, or whether the
 * backend needs something else (e.g. a short code delivered as plain text
 * in the SMS/email, entered manually - never as a link/token).
 */

import api from './api';

/**
 * Finalizes parent activation: verifies the Firebase phone-OTP proof for
 * the given phone number, then sets the parent's permanent username and
 * password in one call - matching the meeting note that this should be a
 * dedicated endpoint rather than the general update-user endpoint, since
 * it only ever touches these two fields.
 *
 * ASSUMED endpoint: POST /auth/parent/activate
 * ASSUMED request:  { phoneNumber, firebaseToken, username, password }
 * ASSUMED response: { message } (no auto-login - the parent logs in
 *                     separately afterwards via the normal /login screen,
 *                     per "First Login: parent uses new credentials to
 *                     log in, which generates their JWT token").
 *
 * @param {Object} params
 * @param {string} params.phoneNumber - The verified phone number, digits only.
 * @param {string} params.firebaseToken - ID token from the Firebase phone-OTP confirmation, proving the parent controls that phone number.
 * @param {string} params.username
 * @param {string} params.password
 */
const activateParent = async ({ phoneNumber, firebaseToken, username, password }) => {
  const response = await api.post('/auth/parent/activate', {
    phoneNumber: (phoneNumber || '').replace(/\D/g, ''),
    firebaseToken,
    username: (username || '').trim(),
    password: password || '',
  });
  return response.data;
};

const parentActivationService = {
  activateParent,
};

export default parentActivationService;