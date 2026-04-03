'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getBookingByRef } from '../../lib/api';
import { resendTicket } from '../../lib/auth';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!ref) { router.push('/'); return; }
    getBookingByRef(ref).then((data) => { setBooking(data); setLoading(false); }).catch(() => setLoading(false));
    sessionStorage.removeItem('nb_route');
    sessionStorage.removeItem('nb_bus');
    sessionStorage.removeItem('nb_seat');
    sessionStorage.removeItem('nb_booking');
  }, [ref, router]);

  const handleDownloadQR = () => {
    if (!booking?.qrCodeData) return;
    const link = document.createElement('a');
    link.href = booking.qrCodeData;
    link.download = `naijabus-ticket-${booking.bookingReference}.png`;
    link.click();
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg({ text: '', type: '' });
    try {
      await resendTicket(ref);
      setResendMsg({ text: `Ticket resent to ${booking?.passenger?.email}`, type: 'success' });
    } catch {
      setResendMsg({ text: 'Failed to resend. Please try again.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
              <p className="text-gray-500 text-sm">Your e-ticket has been sent to <strong>{booking?.passenger?.email}</strong></p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-center mb-5">
              <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
              <p className="text-xl font-bold text-green-700 tracking-widest">{ref}</p>
            </div>

            {booking?.qrCodeData && (
              <div className="text-center mb-5">
                <p className="text-sm font-medium text-gray-700 mb-3">Your QR Ticket</p>
                <img src={booking.qrCodeData} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-green-700 rounded-2xl" />
                <p className="text-xs text-gray-400 mt-2">Present this at the terminal to board</p>
              </div>
            )}

            {booking?.qrCodeData && (
              <div className="flex gap-3 mb-4">
                <button onClick={handleDownloadQR} className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download QR
                </button>
                <button onClick={handleResend} disabled={resending} className="flex-1 flex items-center justify-center gap-2 border border-green-200 text-green-700 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-60">
                  {resending ? <span className="w-4 h-4 border border-green-700 border-t-transparent rounded-full animate-spin"></span> : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  )}
                  Resend Email
                </button>
              </div>
            )}

            {resendMsg.text && (
              <div className={`text-sm text-center rounded-xl px-4 py-2.5 mb-4 ${resendMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{resendMsg.text}</div>
            )}

            {booking && (
              <div className="divide-y divide-gray-100 text-sm mb-5">
                <div className="flex justify-between py-2.5"><span className="text-gray-400">Route</span><span className="font-medium">{booking.bus?.route?.from} → {booking.bus?.route?.to}</span></div>
                <div className="flex justify-between py-2.5"><span className="text-gray-400">Date</span><span className="font-medium">{formatDate(booking.travelDate)}</span></div>
                <div className="flex justify-between py-2.5"><span className="text-gray-400">Bus</span><span className="font-medium">{booking.bus?.name}</span></div>
                <div className="flex justify-between py-2.5"><span className="text-gray-400">Seat</span><span className="font-medium">Seat {booking.seatNumber}</span></div>
                <div className="flex justify-between py-2.5"><span className="text-gray-400">Passenger</span><span className="font-medium">{booking.passenger?.name}</span></div>
                <div className="flex justify-between py-2.5 font-bold"><span className="text-gray-700">Total Paid</span><span className="text-green-700">₦{booking.totalAmount?.toLocaleString()}</span></div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-800 mb-5">
              ⏰ <strong>Arrive 30 minutes before departure</strong> and bring a valid ID.
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1 text-center border border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors">My Bookings</Link>
              <Link href="/" className="flex-1 text-center bg-green-700 text-white font-semibold text-sm py-3 rounded-xl hover:bg-green-600 transition-colors">Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
