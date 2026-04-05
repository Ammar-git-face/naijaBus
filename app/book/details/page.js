'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../../components/Stepper';
import { createBooking } from '../../../lib/api';
import { isLoggedIn, getStoredUser, authHeader } from '../../../lib/auth';
import axios from 'axios';

export default function DetailsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('nb_route') || !sessionStorage.getItem('nb_bus') || !sessionStorage.getItem('nb_seat')) {
      router.push('/book'); return;
    }
    // Pre-fill from logged-in user profile
    if (isLoggedIn()) {
      const u = getStoredUser();
      if (u) {
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
      }
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) { setError('Please fill in all fields'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      const bus = JSON.parse(sessionStorage.getItem('nb_bus'));
      const route = JSON.parse(sessionStorage.getItem('nb_route'));
      const seatNumber = parseInt(sessionStorage.getItem('nb_seat'));

      // Pass auth header so booking gets linked to user account
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/bookings`, {
        busId: bus._id, travelDate: route.date, seatNumber, passenger: { name, email, phone },
      }, { headers: authHeader() });

      sessionStorage.setItem('nb_booking', JSON.stringify(res.data.data));
      router.push('/book/summary');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Your Trip</h1>
      <Stepper currentStep={4} />

      <div className="mt-6">
        <button onClick={() => router.push('/book/seats')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to seat selection</button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
          <div className="flex items-center gap-2 mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2 className="text-xl font-bold text-gray-900">Passenger Information</h2>
          </div>

          {isLoggedIn() && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-xs text-green-700 font-medium">Pre-filled from your profile. You can edit if needed.</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <input type="tel" placeholder="+234 800 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-70">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Saving...
              </span>
            ) : 'Review Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
