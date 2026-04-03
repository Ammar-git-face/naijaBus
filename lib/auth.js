import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

// ── Token helpers ──────────────────────────────────────────
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nb_token');
};

export const setToken = (token) => {
  localStorage.setItem('nb_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('nb_token');
  localStorage.removeItem('nb_user');
};

// ── User helpers ───────────────────────────────────────────
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('nb_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('nb_user', JSON.stringify(user));
};

export const isLoggedIn = () => !!getToken();

// ── Auth header ────────────────────────────────────────────
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── API calls ──────────────────────────────────────────────
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me', { headers: authHeader() });
  return res.data.user;
};

export const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data, { headers: authHeader() });
  return res.data.user;
};

export const changePassword = async (data) => {
  const res = await api.put('/auth/change-password', data, { headers: authHeader() });
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get('/bookings/my', { headers: authHeader() });
  return res.data.data;
};

export const resendTicket = async (ref) => {
  const res = await api.post(`/payment/resend/${ref}`);
  return res.data;
};
