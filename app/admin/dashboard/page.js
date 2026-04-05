'use client';
import { useState, useEffect } from 'react';
import { fetchStats } from '../../../lib/adminAuth';

const StatCard = ({ label, value, sub, color = 'green', icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${color === 'green' ? 'bg-green-50 text-green-700' :
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
          'bg-purple-50 text-purple-600'}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (n) => `₦${(n || 0).toLocaleString()}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });

  // Simple bar chart with inline styles
  const maxRevenue = stats?.dailyRevenue?.length ? Math.max(...stats.dailyRevenue.map((d) => d.revenue)) : 1;

  const statusBadge = (status) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-500';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">System Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Real-time snapshot of the NaijaBus platform</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          sub={`${stats?.paidBookings} paid tickets`}
          color="green"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings?.toLocaleString()}
          sub={`${stats?.pendingBookings} pending`}
          color="blue"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        />
        <StatCard
          label="Registered Users"
          value={stats?.totalUsers?.toLocaleString()}
          sub="Active accounts"
          color="purple"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Active Routes"
          value={stats?.totalRoutes}
          sub={`${stats?.totalBuses} buses`}
          color="yellow"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Revenue — Last 7 Days</h2>
          {stats?.dailyRevenue?.length > 0 ? (
            <div className="flex items-end gap-2 h-36">
              {/* Fill in any missing days */}
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split('T')[0];
                const found = stats.dailyRevenue.find((r) => r._id === key);
                const revenue = found?.revenue || 0;
                const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                const label = d.toLocaleDateString('en-NG', { weekday: 'short' });
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{revenue > 0 ? `₦${(revenue / 1000).toFixed(0)}k` : ''}</span>
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '96px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-green-600 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(pct, revenue > 0 ? 4 : 0)}%` }}
                      />
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

        {/* Booking status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Booking Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Paid', count: stats?.paidBookings || 0, color: 'bg-green-500' },
              { label: 'Pending', count: stats?.pendingBookings || 0, color: 'bg-yellow-400' },
              { label: 'Failed', count: stats?.failedBookings || 0, color: 'bg-red-400' },
            ].map((item) => {
              const pct = stats?.totalBookings > 0 ? Math.round((item.count / stats.totalBookings) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalBookings > 0 ? Math.round((stats.paidBookings / stats.totalBookings) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400">Paid / Total bookings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top routes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Top Routes by Revenue</h2>
          {stats?.topRoutes?.length > 0 ? (
            <div className="space-y-3">
              {stats.topRoutes.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r._id.from} → {r._id.to}</p>
                      <p className="text-xs text-gray-400">{r.bookings} bookings</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-700">₦{r.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No route data yet</p>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Recent Paid Bookings</h2>
          {stats?.recentBookings?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.passenger?.name}</p>
                    <p className="text-xs text-gray-400">{b.bus?.route?.from} → {b.bus?.route?.to} · {b.bookingReference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">₦{b.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
