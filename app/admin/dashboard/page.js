'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchStats } from '../../../lib/adminAuth';

const StatCard = ({ label, value, sub, icon, accent = '#276749', bg = '#f0f7f3' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg, color: accent }}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const TripStatusBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
  const maxRevenue = stats?.dailyRevenue?.length ? Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1) : 1;
  const totalTrips = (stats?.upcomingTrips || 0) + (stats?.completedTrips || 0) + (stats?.cancelledTrips || 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time snapshot of the NaijaBus platform</p>
        </div>
        <Link href="/admin/activity"
          className="flex items-center gap-2 text-sm font-semibold text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Live Activity
        </Link>
      </div>

      {/* Row 1 — financial + volume stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Revenue" value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`}
          sub={`${stats?.paidBookings || 0} paid tickets`} accent="#276749" bg="#f0f7f3"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        <StatCard label="Total Bookings" value={(stats?.totalBookings || 0).toLocaleString()}
          sub={`${stats?.pendingBookings || 0} pending payment`} accent="#2563eb" bg="#eff6ff"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
        <StatCard label="Registered Users" value={(stats?.totalUsers || 0).toLocaleString()}
          sub="Active accounts" accent="#7c3aed" bg="#f5f3ff"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        <StatCard label="Active Routes" value={stats?.totalRoutes || 0}
          sub={`${stats?.totalBuses || 0} buses`} accent="#d97706" bg="#fffbeb"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} />
      </div>

      {/* Row 2 — trip status cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.upcomingTrips || 0}</p>
            <p className="text-xs text-gray-500">Upcoming Trips</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.completedTrips || 0}</p>
            <p className="text-xs text-gray-500">Completed Trips</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.cancelledTrips || 0}</p>
            <p className="text-xs text-gray-500">Cancelled Trips</p>
          </div>
        </div>
      </div>

      {/* Row 3 — charts + breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Revenue — Last 7 Days</h2>
          {stats?.dailyRevenue?.length > 0 ? (
            <div className="flex items-end gap-2 h-36">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split('T')[0];
                const found = stats.dailyRevenue.find((r) => r._id === key);
                const revenue = found?.revenue || 0;
                const pct = (revenue / maxRevenue) * 100;
                const label = d.toLocaleDateString('en-NG', { weekday: 'short' });
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 truncate w-full text-center">
                      {revenue > 0 ? `₦${(revenue/1000).toFixed(0)}k` : ''}
                    </span>
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '96px' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(pct, revenue > 0 ? 5 : 0)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Breakdown panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Trip Status Breakdown</h2>
          <div className="space-y-3">
            <TripStatusBar label="Upcoming" count={stats?.upcomingTrips || 0} total={totalTrips} color="#276749" />
            <TripStatusBar label="Completed" count={stats?.completedTrips || 0} total={totalTrips} color="#2563eb" />
            <TripStatusBar label="Cancelled" count={stats?.cancelledTrips || 0} total={totalTrips} color="#ef4444" />
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Success Rate</span>
              <span className="font-bold text-green-700">
                {stats?.totalBookings > 0 ? Math.round((stats.paidBookings / stats.totalBookings) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cancellation Rate</span>
              <span className="font-bold text-red-500">
                {stats?.paidBookings > 0 ? Math.round(((stats.cancelledTrips || 0) / stats.paidBookings) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completion Rate</span>
              <span className="font-bold text-blue-600">
                {stats?.paidBookings > 0 ? Math.round(((stats.completedTrips || 0) / stats.paidBookings) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 — top routes + recent bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Top Routes by Revenue</h2>
            <Link href="/admin/routes" className="text-xs text-green-700 hover:underline font-medium">Manage →</Link>
          </div>
          {stats?.topRoutes?.length > 0 ? (
            <div className="space-y-3">
              {stats.topRoutes.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r._id.from} → {r._id.to}</p>
                      <p className="text-xs text-gray-400">{r.bookings} bookings</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-700">₦{r.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No data yet</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Recent Paid Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-green-700 hover:underline font-medium">View all →</Link>
          </div>
          {stats?.recentBookings?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                      {b.passenger?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{b.passenger?.name}</p>
                      <p className="text-xs text-gray-400">{b.bus?.route?.from} → {b.bus?.route?.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">₦{b.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No bookings yet</p>}
        </div>
      </div>
    </div>
  );
}
