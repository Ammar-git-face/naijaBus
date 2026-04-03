'use client';
import { useState, useEffect } from 'react';
import { getActivityFeed } from '../../../lib/adminAuth';

const payBadge = (s) => {
  if (s === 'paid')    return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-500';
};

const tripIcon = (tripStatus, payStatus) => {
  if (payStatus === 'failed')     return { icon: '✕', bg: 'bg-red-100',    text: 'text-red-500',  label: 'Payment Failed' };
  if (payStatus === 'pending')    return { icon: '⏳', bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Awaiting Payment' };
  if (tripStatus === 'cancelled') return { icon: '✕', bg: 'bg-red-100',    text: 'text-red-500',  label: 'Trip Cancelled' };
  if (tripStatus === 'completed') return { icon: '✓', bg: 'bg-blue-100',   text: 'text-blue-600', label: 'Trip Completed' };
  return { icon: '🚌', bg: 'bg-green-100', text: 'text-green-700', label: 'Ticket Booked' };
};

export default function ActivityFeedPage() {
  const [feed, setFeed]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    getActivityFeed()
      .then((data) => { setFeed(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = feed.filter((b) => {
    if (filter === 'paid')      return b.paymentStatus === 'paid' && b.tripStatus === 'upcoming';
    if (filter === 'completed') return b.tripStatus === 'completed';
    if (filter === 'cancelled') return b.tripStatus === 'cancelled';
    if (filter === 'pending')   return b.paymentStatus === 'pending';
    return true;
  });

  const formatTime = (d) => {
    const date = new Date(d);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };

  const filters = [
    { key: 'all',       label: 'All Activity' },
    { key: 'paid',      label: 'Active Bookings' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'pending',   label: 'Pending' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Activity Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live view of all booking events across the platform</p>
        </div>
        <button onClick={() => { setLoading(true); getActivityFeed().then((d) => { setFeed(d); setLoading(false); }); }}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors
              ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
              ${filter === f.key ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
              {f.key === 'all' ? feed.length : feed.filter((b) => {
                if (f.key === 'paid')      return b.paymentStatus === 'paid' && b.tripStatus === 'upcoming';
                if (f.key === 'completed') return b.tripStatus === 'completed';
                if (f.key === 'cancelled') return b.tripStatus === 'cancelled';
                if (f.key === 'pending')   return b.paymentStatus === 'pending';
                return true;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Flow summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Bookings',  count: feed.filter((b) => b.paymentStatus === 'paid' && b.tripStatus === 'upcoming').length,  color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pending Payment',  count: feed.filter((b) => b.paymentStatus === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Completed Trips',  count: feed.filter((b) => b.tripStatus === 'completed').length,  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Cancelled Trips',  count: feed.filter((b) => b.tripStatus === 'cancelled').length,  color: 'text-red-500',    bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Recent Events</h2>
          <span className="text-xs text-gray-400">{filtered.length} events</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No events in this category</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((b, idx) => {
              const ev = tripIcon(b.tripStatus, b.paymentStatus);
              return (
                <div key={b._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-full ${ev.bg} ${ev.text} flex items-center justify-center text-xs font-bold`}>
                      {ev.icon}
                    </div>
                    {idx < filtered.length - 1 && (
                      <div className="w-px bg-gray-100 flex-1 mt-1" style={{ minHeight: '16px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{b.passenger?.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{b.bookingReference}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payBadge(b.paymentStatus)}`}>
                            {b.paymentStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          <span className="font-medium text-gray-700">{ev.label}</span>
                          {' · '}
                          {b.bus?.route?.from} → {b.bus?.route?.to}
                          {' · '}
                          {b.bus?.name}
                          {' · '}
                          Seat {b.seatNumber}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Travel: {new Date(b.travelDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          ₦{b.totalAmount?.toLocaleString()}
                          {b.passenger?.email && ` · ${b.passenger.email}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {formatTime(b.updatedAt || b.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
