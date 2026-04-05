'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Stepper from '../../components/Stepper';
import { getDepartureCities, getDestinations } from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';

export default function BookPage() {
  const router = useRouter();
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    getDepartureCities()
      .then(setDepartures)
      .catch(() => setError('Failed to load cities. Make sure the backend is running.'));
  }, []);

  useEffect(() => {
    if (!from) { setDestinations([]); setTo(''); return; }
    getDestinations(from).then(setDestinations).catch(() => {});
    setTo('');
  }, [from]);

  const handleSearch = () => {
    if (!from || !to || !date) { setError('Please fill in all fields'); return; }
    if (!loggedIn) {
      sessionStorage.setItem('nb_redirect', '/book/buses');
      sessionStorage.setItem('nb_route', JSON.stringify({ from, to, date }));
      router.push('/auth/login');
      return;
    }
    setError('');
    sessionStorage.setItem('nb_route', JSON.stringify({ from, to, date }));
    router.push('/book/buses');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Your Trip</h1>
      <Stepper currentStep={1} />

      {/* Guest notice */}
      {!loggedIn && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-sm text-blue-700">
            <Link href="/auth/login" className="font-semibold underline">Log in</Link> or{' '}
            <Link href="/auth/register" className="font-semibold underline">create an account</Link> to save your booking history.
          </p>
        </div>
      )}

      <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <h2 className="text-xl font-bold text-gray-900">Select Your Route</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Departure City</label>
            <div className="relative">
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent pr-10">
                <option value="">Select departure</option>
                {departures.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination</label>
            <div className="relative">
              <select value={to} onChange={(e) => setTo(e.target.value)} disabled={!from}
                className={`w-full appearance-none border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent pr-10 ${to ? 'border-green-700 text-gray-700' : 'border-gray-200 text-gray-400'} ${!from ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="">Select destination</option>
                {destinations.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Travel Date</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button onClick={handleSearch} disabled={!from || !to || !date}
          className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Search Buses
        </button>
      </div>
    </div>
  );
}
