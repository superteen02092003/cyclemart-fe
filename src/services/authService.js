/**
 * Authentication API Service
 * Handles all auth-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Register new user
 * @param {Object} formData - { fullName, email, phone, password }
 * @returns {Promise<Object>} - OTP response
 */
export const registerUser = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

/**
 * Send OTP to email
 * @param {string} email - User email
 * @returns {Promise<Object>} - OTP response
 */
export const sendOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/send-otp?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

/**
 * Verify OTP and activate account
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<Object>} - User info response
 */
export const verifyOtp = async (email, otpCode) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      otpCode
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

/**
 * Login user
 * @param {Object} formData - { email, password }
 * @returns {Promise<Object>} - Login response with token
 */
export const loginUser = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};
