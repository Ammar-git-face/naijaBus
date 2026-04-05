'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../../components/Stepper';
import { initializePayment } from '../../../lib/api';

export default function SummaryPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const b = sessionStorage.getItem('nb_booking');
    const busData = sessionStorage.getItem('nb_bus');
    const routeData = sessionStorage.getItem('nb_route');

    if (!b || !busData || !routeData) { router.push('/book'); return; }

    setBooking(JSON.parse(b));
    setBus(JSON.parse(busData));
    setRoute(JSON.parse(routeData));
  }, [router]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await initializePayment(booking._id);
      if (result.paymentLink) {
        // Redirect to Flutterwave payment page
        window.location.href = result.paymentLink;
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!booking || !bus || !route) return null;

  const rows = [
    { label: 'Route', value: `${route.from} → ${route.to}` },
    { label: 'Date', value: formatDate(route.date) },
    { label: 'Bus', value: bus.name },
    { label: 'Time', value: `${bus.departureTime} → ${bus.arrivalTime}` },
    { label: 'Seat', value: `Seat ${booking.seatNumber}` },
    { label: 'Passenger', value: booking.passenger?.name },
    { label: 'Email', value: booking.passenger?.email },
    { label: 'Phone', value: booking.passenger?.phone },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Your Trip</h1>
      <Stepper currentStep={5} />

      <div className="mt-6">
        {/* Back */}
        <button onClick={() => router.push('/book/details')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Back to details
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Booking Summary</h2>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">{row.label}</span>
                <span className="text-sm text-gray-900 font-medium text-right max-w-xs">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-700">
              ₦{booking.totalAmount?.toLocaleString()}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          {/* Payment button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-5 bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Redirecting to payment...
              </span>
            ) : 'Proceed to Payment'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secured by Flutterwave
          </p>
        </div>
      </div>
    </div>
  );
}
