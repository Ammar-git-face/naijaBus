import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Routes
export const getDepartureCities = () => api.get('/routes/departures').then(r => r.data.data);
export const getDestinations = (from) => api.get(`/routes/destinations/${encodeURIComponent(from)}`).then(r => r.data.data);

// Buses
export const searchBuses = (from, to, date) =>
  api.get('/buses/search', { params: { from, to, date } }).then(r => r.data.data);
export const getBusSeats = (busId, date) =>
  api.get(`/buses/${busId}/seats`, { params: { date } }).then(r => r.data.data);

// Bookings
export const createBooking = (payload) => api.post('/bookings', payload).then(r => r.data.data);
export const getBookingByRef = (ref) => api.get(`/bookings/ref/${ref}`).then(r => r.data.data);

// Payment
export const initializePayment = (bookingId) =>
  api.post('/payment/initialize', { bookingId }).then(r => r.data);
export const getPaymentStatus = (ref) =>
  api.get(`/payment/status/${ref}`).then(r => r.data.data);
