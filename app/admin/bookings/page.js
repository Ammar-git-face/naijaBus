'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchAllBookings, updateBookingTripStatus, getBookingDetail } from '../../../lib/adminAuth';

const paymentBadge = (s) => {
  if (s === 'paid')    return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-500';
};

const tripBadge = (s) => {
  if (s === 'completed') return { cls: 'bg-blue-100 text-blue-600',   label: 'Completed' };
  if (s === 'cancelled') return { cls: 'bg-red-100 text-red-500',     label: 'Cancelled'  };
  return                          { cls: 'bg-green-100 text-green-700', label: 'Upcoming'   };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [payStatus, setPayStatus]   = useState('all');
  const [tripStatus, setTripStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]         = useState('');
  const [actionId, setActionId]     = useState(null);
  const [toast, setToast]           = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback((page = 1) => {
    setLoading(true);
    const params = { page, limit: 15, search };
    if (payStatus !== 'all') params.status = payStatus;
    if (tripStatus !== 'all') params.tripStatus = tripStatus;
    fetchAllBookings(params)
      .then((data) => { setBookings(data.data); setPagination(data.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  }, [payStatus, tripStatus, search]);

  useEffect(() => { load(1); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setActionId(id);
    try {
      const updated = await updateBookingTripStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, tripStatus: updated.tripStatus } : b));
      showToast(`Trip marked as ${newStatus}`);
    } catch {
      showToast('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailModal({ loading: true });
    try {
      const data = await getBookingDetail(id);
      setDetailModal(data);
    } catch {
      setDetailModal(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total bookings in the system</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input type="text" placeholder="Search by name, email, or reference…" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
          </div>
          <button type="submit" className="bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors">Search</button>
        </form>

        <div className="flex flex-wrap gap-3">
          {/* Payment status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Payment:</span>
            {['all', 'paid', 'pending', 'failed'].map((s) => (
              <button key={s} onClick={() => setPayStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors
                  ${payStatus === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Trip status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Trip:</span>
            {['all', 'upcoming', 'completed', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setTripStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors
                  ${tripStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Reference', 'Passenger', 'Route', 'Date', 'Seat', 'Amount', 'Payment', 'Trip Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No bookings found</td></tr>
              ) : bookings.map((b) => {
                const trip = tripBadge(b.tripStatus);
                const isActing = actionId === b._id;
                return (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-green-700 font-semibold whitespace-nowrap">{b.bookingReference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 whitespace-nowrap">{b.passenger?.name}</p>
                      <p className="text-xs text-gray-400">{b.passenger?.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-xs">{b.bus?.route?.from} → {b.bus?.route?.to}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">{formatDate(b.travelDate)}</td>
                    <td className="px-4 py-3 text-gray-600 text-center">{b.seatNumber}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">₦{b.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${paymentBadge(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trip.cls}`}>{trip.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* View detail */}
                        <button onClick={() => openDetail(b._id)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                          View
                        </button>

                        {/* Trip status controls — only for paid bookings */}
                        {b.paymentStatus === 'paid' && b.tripStatus === 'upcoming' && (
                          <>
                            <button onClick={() => handleStatusChange(b._id, 'completed')}
                              disabled={isActing}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                              {isActing ? '…' : '✓ Done'}
                            </button>
                            <button onClick={() => handleStatusChange(b._id, 'cancelled')}
                              disabled={isActing}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                              {isActing ? '…' : '✕ Cancel'}
                            </button>
                          </>
                        )}

                        {/* Restore cancelled → upcoming */}
                        {b.paymentStatus === 'paid' && b.tripStatus === 'cancelled' && (
                          <button onClick={() => handleStatusChange(b._id, 'upcoming')}
                            disabled={isActing}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                            {isActing ? '…' : '↺ Restore'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages} · {pagination.total} results</p>
            <div className="flex gap-2">
              <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Booking detail modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Booking Detail</h3>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {detailModal.loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <>
                {/* Reference + status */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Booking Reference</p>
                    <p className="font-mono text-green-700 font-bold text-base tracking-widest">{detailModal.bookingReference}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentBadge(detailModal.paymentStatus)}`}>
                      {detailModal.paymentStatus}
                    </span>
                    <br />
                    <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${tripBadge(detailModal.tripStatus).cls}`}>
                      {tripBadge(detailModal.tripStatus).label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
                  {[
                    ['Route',       `${detailModal.bus?.route?.from} → ${detailModal.bus?.route?.to}`],
                    ['Travel Date', formatDate(detailModal.travelDate)],
                    ['Bus',         detailModal.bus?.name],
                    ['Time',        `${detailModal.bus?.departureTime} → ${detailModal.bus?.arrivalTime}`],
                    ['Seat',        `Seat ${detailModal.seatNumber}`],
                    ['Amount',      `₦${detailModal.totalAmount?.toLocaleString()}`],
                    ['Booked On',   formatDateTime(detailModal.createdAt)],
                    ['Flutterwave', detailModal.flutterwaveRef || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="font-medium text-gray-900 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Passenger */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Passenger</p>
                  <p className="font-semibold text-gray-900">{detailModal.passenger?.name}</p>
                  <p className="text-sm text-gray-500">{detailModal.passenger?.email}</p>
                  <p className="text-sm text-gray-500">{detailModal.passenger?.phone}</p>
                </div>

                {/* Account */}
                {detailModal.user && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Linked Account</p>
                    <p className="font-semibold text-green-700">{detailModal.user?.name}</p>
                    <p className="text-sm text-gray-500">{detailModal.user?.email}</p>
                  </div>
                )}

                {/* QR code */}
                {detailModal.qrCodeData && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">QR Code</p>
                    <img src={detailModal.qrCodeData} alt="QR" className="w-32 h-32 mx-auto border-4 border-green-700 rounded-xl" />
                  </div>
                )}

                {/* Admin trip status controls */}
                {detailModal.paymentStatus === 'paid' && (
                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 self-center mr-auto">Update trip status:</p>
                    {detailModal.tripStatus !== 'completed' && (
                      <button onClick={() => { handleStatusChange(detailModal._id, 'completed'); setDetailModal(null); }}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        ✓ Mark Complete
                      </button>
                    )}
                    {detailModal.tripStatus === 'upcoming' && (
                      <button onClick={() => { handleStatusChange(detailModal._id, 'cancelled'); setDetailModal(null); }}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        ✕ Cancel Trip
                      </button>
                    )}
                    {detailModal.tripStatus === 'cancelled' && (
                      <button onClick={() => { handleStatusChange(detailModal._id, 'upcoming'); setDetailModal(null); }}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors">
                        ↺ Restore
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
