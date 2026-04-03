'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers } from '../../../lib/adminAuth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback((page = 1) => {
    setLoading(true);
    fetchAllUsers({ search, page, limit: 15 })
      .then((data) => { setUsers(data.data); setPagination(data.pagination); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Registered Users</h1>
        <p className="text-gray-500 text-sm mt-0.5">{pagination.total} users in the system</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input type="text" placeholder="Search by name or email..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
          </div>
          <button type="submit" className="bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Phone', 'Total Bookings', 'Total Spent', 'Joined'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 whitespace-nowrap">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      {u.bookingCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₦{u.totalSpent?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
