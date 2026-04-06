import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nb_admin_token');
};

export const setAdminToken = (token) => localStorage.setItem('nb_admin_token', token);
export const setAdminUser = (admin) => localStorage.setItem('nb_admin', JSON.stringify(admin));
export const getAdminUser = () => {
  try { return JSON.parse(localStorage.getItem('nb_admin')); } catch { return null; }
};
export const removeAdminSession = () => {
  localStorage.removeItem('nb_admin_token');
  localStorage.removeItem('nb_admin');
};
export const isAdminLoggedIn = () => !!getAdminToken();

export const adminAuthHeader = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API helpers
const h = () => ({ headers: adminAuthHeader() });

export const adminLoginApi = (data) => api.post('/admin/login', data).then(r => r.data);
export const fetchStats = () => api.get('/admin/stats', h()).then(r => r.data.data);
export const fetchAllBookings = (params) => api.get('/admin/bookings', { ...h(), params }).then(r => r.data);
export const fetchAllUsers = (params) => api.get('/admin/users', { ...h(), params }).then(r => r.data);
export const fetchAdminRoutes = () => api.get('/admin/routes', h()).then(r => r.data.data);
export const createAdminRoute = (data) => api.post('/admin/routes', data, h()).then(r => r.data.data);
export const toggleAdminRoute = (id) => api.patch(`/admin/routes/${id}/toggle`, {}, h()).then(r => r.data.data);
export const deleteAdminRoute = (id) => api.delete(`/admin/routes/${id}`, h()).then(r => r.data);
export const fetchAdminBuses = () => api.get('/admin/buses', h()).then(r => r.data.data);
export const createAdminBus = (data) => api.post('/admin/buses', data, h()).then(r => r.data.data);
export const updateAdminBus = (id, data) => api.put(`/admin/buses/${id}`, data, h()).then(r => r.data.data);
export const deleteAdminBus = (id) => api.delete(`/admin/buses/${id}`, h()).then(r => r.data);
export const updateBookingTripStatus = (id, tripStatus) => api.patch(`/admin/bookings/${id}/trip-status`, { tripStatus }, h()).then(r => r.data.data);
export const getBookingDetail = (id) => api.get(`/admin/bookings/${id}`, h()).then(r => r.data.data);
export const getActivityFeed = () => api.get('/admin/activity', h()).then(r => r.data.data);
