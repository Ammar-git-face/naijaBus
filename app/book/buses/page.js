'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../../components/Stepper';
import { searchBuses } from '../../../lib/api';

export default function BusesPage() {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('nb_route');
    if (!stored) { router.push('/book'); return; }

    const { from, to, date } = JSON.parse(stored);
    setRoute({ from, to, date });

    searchBuses(from, to, date)
      .then((data) => { setBuses(data); setLoading(false); })
      .catch(() => { setError('Failed to load buses. Please try again.'); setLoading(false); });
  }, [router]);

  const selectBus = (bus) => {
    sessionStorage.setItem('nb_bus', JSON.stringify(bus));
    router.push('/book/seats');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Your Trip</h1>
      <Stepper currentStep={2} />

      <div className="mt-6">
        {/* Back */}
        <button onClick={() => router.push('/book')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Back to search
        </button>

        {route && (
          <p className="font-semibold text-gray-900 mb-4 text-base">
            {route.from} → {route.to} · {formatDate(route.date)}
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Searching buses...</span>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && !error && buses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No buses available for this route on the selected date.</p>
            <button onClick={() => router.push('/book')} className="mt-4 text-green-700 font-medium text-sm underline">
              Try a different route
            </button>
          </div>
        )}

        {/* Bus cards */}
        <div className="flex flex-col gap-3">
          {buses.map((bus) => (
            <div key={bus._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{bus.name}</h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  {bus.departureTime} → {bus.arrivalTime}
                </p>
                <p className="text-gray-400 text-xs mt-1">{bus.availableSeats} seats available</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-green-700 font-bold text-lg">
                  ₦{bus.pricePerSeat.toLocaleString()}
                </span>
                <button
                  onClick={() => selectBus(bus)}
                  className="bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-600 transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
