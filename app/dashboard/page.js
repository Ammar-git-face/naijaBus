'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getStoredUser, isLoggedIn, getMyBookings, resendTicket, cancelBooking, completeBooking } from '../../lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // bookingId of in-progress action
  const [resendingRef, setResendingRef] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [qrModal, setQrModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { id, action: 'cancel'|'complete' }

  useEffect(() => {
    if (!isLoggedIn()) {
      sessionStorage.setItem('nb_redirect', '/dashboard');
      router.push('/auth/login');
      return;
    }
    setUser(getStoredUser());
    getMyBookings()
      .then((data) => { setBookings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const handleCancel = async (id) => {
    setConfirmModal(null);
    setActionLoading(id);
    try {
      const updated = await cancelBooking(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, tripStatus: updated.tripStatus } : b));
      showToast('Booking cancelled successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    setConfirmModal(null);
    setActionLoading(id);
    try {
      const updated = await completeBooking(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, tripStatus: updated.tripStatus } : b));
      showToast('Trip marked as completed!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update trip', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (ref) => {
    setResendingRef(ref);
    try {
      await resendTicket(ref);
      showToast('Ticket resent to your email!');
    } catch {
      showToast('Failed to resend ticket', 'error');
    } finally {
      setResendingRef(null);
    }
  };

  const downloadQR = (booking) => {
    if (!booking.qrCodeData) return;
    const link = document.createElement('a');
    link.href = booking.qrCodeData;
    link.download = `naijabus-ticket-${booking.bookingReference}.png`;
    link.click();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Stats ──────────────────────────────────
  const totalBookings   = bookings.length;
  const paidBookings    = bookings.filter((b) => b.paymentStatus === 'paid').length;
  const pendingBookings = bookings.filter((b) => b.paymentStatus === 'pending').length;
  const completedTrips  = bookings.filter((b) => b.tripStatus === 'completed').length;
  const cancelledTrips  = bookings.filter((b) => b.tripStatus === 'cancelled').length;

  // ── Filtered list ──────────────────────────
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all')       return true;
    if (activeTab === 'upcoming')  return b.paymentStatus === 'paid' && b.tripStatus === 'upcoming';
    if (activeTab === 'completed') return b.tripStatus === 'completed';
    if (activeTab === 'cancelled') return b.tripStatus === 'cancelled';
    if (activeTab === 'pending')   return b.paymentStatus === 'pending';
    return true;
  });

  // ── Badge styles ───────────────────────────
  const tripBadge = (b) => {
    if (b.tripStatus === 'cancelled') return { label: 'Cancelled', cls: 'bg-red-100 text-red-500' };
    if (b.tripStatus === 'completed') return { label: 'Completed', cls: 'bg-blue-100 text-blue-600' };
    if (b.paymentStatus === 'pending') return { label: 'Pending Payment', cls: 'bg-yellow-100 text-yellow-700' };
    if (b.paymentStatus === 'failed')  return { label: 'Payment Failed', cls: 'bg-red-100 text-red-500' };
    return { label: 'Upcoming', cls: 'bg-green-100 text-green-700' };
  };

  const canCancel   = (b) => b.paymentStatus === 'paid' && b.tripStatus === 'upcoming';
  const canComplete = (b) => b.paymentStatus === 'paid' && b.tripStatus === 'upcoming';

  if (!user) return null;

  const getInitials = (n) => n?.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase() || '?';

  const tabs = [
    { key: 'all',       label: 'All',       count: totalBookings },
    { key: 'upcoming',  label: 'Upcoming',  count: bookings.filter((b) => b.paymentStatus === 'paid' && b.tripStatus === 'upcoming').length },
    { key: 'completed', label: 'Completed', count: completedTrips },
    { key: 'cancelled', label: 'Cancelled', count: cancelledTrips },
    { key: 'pending',   label: 'Pending',   count: pendingBookings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-700 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome banner */}
        <div className="bg-green-700 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-green-200 text-xs">Welcome back 👋</p>
              <h1 className="text-xl font-bold text-white leading-tight">{user.name}</h1>
              <p className="text-green-200 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
          <Link href="/book"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors w-fit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Book New Trip
          </Link>
        </div>

        {/* Stats — 4 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label: 'Total Bookings', value: totalBookings, color: 'text-gray-900', bg: 'bg-white',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            { label: 'Paid Bookings', value: paidBookings, color: 'text-green-700', bg: 'bg-white',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { label: 'Pending', value: pendingBookings, color: 'text-yellow-600', bg: 'bg-white',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: 'Completed Trips', value: completedTrips, color: 'text-blue-600', bg: 'bg-white',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-4`}>
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center mb-3">{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

          {/* Tabs + header */}
          <div className="px-5 pt-5 pb-0 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">My Bookings</h2>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-colors border-b-2
                    ${activeTab === t.key
                      ? 'text-green-700 border-green-700 bg-green-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Booking cards */}
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No bookings in this category</p>
              {activeTab === 'all' && (
                <Link href="/book" className="inline-block mt-3 text-green-700 text-sm font-semibold hover:underline">Book your first trip →</Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredBookings.map((booking) => {
                const badge = tripBadge(booking);
                const isActing = actionLoading === booking._id;
                return (
                  <div key={booking._id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                      {/* Left: booking info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">
                            {booking.bus?.route?.from} → {booking.bus?.route?.to}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span>📅 {formatDate(booking.travelDate)}</span>
                          <span>🚌 {booking.bus?.name}</span>
                          <span>💺 Seat {booking.seatNumber}</span>
                          <span>⏰ {booking.bus?.departureTime} → {booking.bus?.arrivalTime}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-mono text-gray-400">{booking.bookingReference}</span>
                          <span className="text-sm font-bold text-green-700">₦{booking.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Right: action buttons */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">

                        {/* QR code button — paid only */}
                        {booking.paymentStatus === 'paid' && booking.qrCodeData && (
                          <button onClick={() => setQrModal(booking)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                            </svg>
                            QR
                          </button>
                        )}

                        {/* Resend email — paid only */}
                        {booking.paymentStatus === 'paid' && (
                          <button onClick={() => handleResend(booking.bookingReference)}
                            disabled={resendingRef === booking.bookingReference}
                            className="flex items-center gap-1.5 text-xs font-medium text-green-700 border border-green-200 px-3 py-2 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-60">
                            {resendingRef === booking.bookingReference
                              ? <span className="w-3 h-3 border border-green-700 border-t-transparent rounded-full animate-spin"></span>
                              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            }
                            Resend
                          </button>
                        )}

                        {/* Mark as completed */}
                        {canComplete(booking) && (
                          <button
                            onClick={() => setConfirmModal({ id: booking._id, action: 'complete', label: `${booking.bus?.route?.from} → ${booking.bus?.route?.to}` })}
                            disabled={isActing}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60">
                            {isActing ? <span className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                            Completed
                          </button>
                        )}

                        {/* Cancel booking */}
                        {canCancel(booking) && (
                          <button
                            onClick={() => setConfirmModal({ id: booking._id, action: 'cancel', label: `${booking.bus?.route?.from} → ${booking.bus?.route?.to}` })}
                            disabled={isActing}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60">
                            {isActing ? <span className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></span>
                              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                            Cancel
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── QR Modal ── */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Your QR Ticket</h3>
              <button onClick={() => setQrModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="text-center mb-4">
              <img src={qrModal.qrCodeData} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-green-700 rounded-xl" />
              <p className="font-mono text-green-700 font-bold text-lg tracking-widest mt-3">{qrModal.bookingReference}</p>
              <p className="text-gray-500 text-sm">{qrModal.bus?.route?.from} → {qrModal.bus?.route?.to}</p>
              <p className="text-gray-400 text-xs mt-0.5">{formatDate(qrModal.travelDate)} · Seat {qrModal.seatNumber}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => downloadQR(qrModal)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
              <button onClick={() => { handleResend(qrModal.bookingReference); setQrModal(null); }}
                className="flex-1 flex items-center justify-center gap-2 border border-green-200 text-green-700 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal (Cancel / Complete) ── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            {confirmModal.action === 'cancel' ? (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">Cancel this booking?</h3>
                <p className="text-gray-500 text-sm text-center mb-5">
                  You're about to cancel your trip: <strong>{confirmModal.label}</strong>. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">Keep Booking</button>
                  <button onClick={() => handleCancel(confirmModal.id)} className="flex-1 bg-red-500 text-white text-sm font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors">Yes, Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">Mark trip as completed?</h3>
                <p className="text-gray-500 text-sm text-center mb-5">
                  Confirm that you have completed your trip: <strong>{confirmModal.label}</strong>.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">Not Yet</button>
                  <button onClick={() => handleComplete(confirmModal.id)} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">Yes, Completed</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
