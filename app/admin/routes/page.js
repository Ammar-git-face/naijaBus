'use client';
import { useState, useEffect } from 'react';
import {
  fetchAdminRoutes, createAdminRoute, toggleAdminRoute, deleteAdminRoute,
  fetchAdminBuses, createAdminBus, updateAdminBus, deleteAdminBus,
} from '../../../lib/adminAuth';

export default function AdminRoutesPage() {
  const [tab, setTab] = useState('routes'); // 'routes' | 'buses'

  // ── Routes state ───────────────────────────
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [newRoute, setNewRoute] = useState({ from: '', to: '' });
  const [routeMsg, setRouteMsg] = useState('');
  const [routeError, setRouteError] = useState('');

  // ── Buses state ────────────────────────────
  const [buses, setBuses] = useState([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [busForm, setBusForm] = useState({ name: '', routeId: '', departureTime: '', arrivalTime: '', totalSeats: '', pricePerSeat: '' });
  const [editingBus, setEditingBus] = useState(null);
  const [showBusForm, setShowBusForm] = useState(false);
  const [busMsg, setBusMsg] = useState('');
  const [busError, setBusError] = useState('');

  const loadRoutes = () => {
    setRoutesLoading(true);
    fetchAdminRoutes().then((d) => { setRoutes(d); setRoutesLoading(false); }).catch(() => setRoutesLoading(false));
  };

  const loadBuses = () => {
    setBusesLoading(true);
    fetchAdminBuses().then((d) => { setBuses(d); setBusesLoading(false); }).catch(() => setBusesLoading(false));
  };

  useEffect(() => { loadRoutes(); loadBuses(); }, []);

  // ── Route handlers ─────────────────────────
  const handleAddRoute = async () => {
    if (!newRoute.from || !newRoute.to) { setRouteError('Both cities are required'); return; }
    if (newRoute.from === newRoute.to) { setRouteError('From and To cannot be the same'); return; }
    setRouteError('');
    try {
      const r = await createAdminRoute(newRoute);
      setRoutes([...routes, { ...r, busCount: 0, bookingCount: 0 }]);
      setNewRoute({ from: '', to: '' });
      setRouteMsg('Route added!');
      setTimeout(() => setRouteMsg(''), 2500);
    } catch (err) { setRouteError(err.response?.data?.message || 'Failed to add route'); }
  };

  const handleToggleRoute = async (id) => {
    const updated = await toggleAdminRoute(id);
    setRoutes(routes.map((r) => r._id === id ? { ...r, isActive: updated.isActive } : r));
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Delete this route? This cannot be undone.')) return;
    await deleteAdminRoute(id);
    setRoutes(routes.filter((r) => r._id !== id));
  };

  // ── Bus handlers ───────────────────────────
  const openBusForm = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setBusForm({
        name: bus.name, routeId: bus.route?._id || '', departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime, totalSeats: bus.totalSeats, pricePerSeat: bus.pricePerSeat,
      });
    } else {
      setEditingBus(null);
      setBusForm({ name: '', routeId: '', departureTime: '', arrivalTime: '', totalSeats: '', pricePerSeat: '' });
    }
    setShowBusForm(true);
    setBusError('');
  };

  const handleSaveBus = async () => {
    const { name, routeId, departureTime, arrivalTime, totalSeats, pricePerSeat } = busForm;
    if (!name || !routeId || !departureTime || !arrivalTime || !totalSeats || !pricePerSeat) {
      setBusError('All fields are required'); return;
    }
    setBusError('');
    try {
      if (editingBus) {
        const updated = await updateAdminBus(editingBus._id, busForm);
        setBuses(buses.map((b) => b._id === editingBus._id ? updated : b));
      } else {
        const created = await createAdminBus(busForm);
        setBuses([created, ...buses]);
      }
      setBusMsg(editingBus ? 'Bus updated!' : 'Bus added!');
      setTimeout(() => setBusMsg(''), 2500);
      setShowBusForm(false);
    } catch (err) { setBusError(err.response?.data?.message || 'Failed to save bus'); }
  };

  const handleDeleteBus = async (id) => {
    if (!confirm('Delete this bus?')) return;
    await deleteAdminBus(id);
    setBuses(buses.filter((b) => b._id !== id));
  };

  const activeRoutes = routes.filter((r) => r.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Routes & Buses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all routes and buses in the system</p>
        </div>
        {tab === 'buses' && (
          <button onClick={() => openBusForm()} className="bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Bus
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['routes', 'buses'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'routes' ? `Routes (${routes.length})` : `Buses (${buses.length})`}
          </button>
        ))}
      </div>

      {/* ── ROUTES TAB ── */}
      {tab === 'routes' && (
        <div className="space-y-4">
          {/* Add route */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Add New Route</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Departure city (e.g. Lagos)" value={newRoute.from}
                onChange={(e) => setNewRoute({ ...newRoute, from: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              <span className="self-center text-gray-400 font-bold hidden sm:block">→</span>
              <input type="text" placeholder="Destination city (e.g. Abuja)" value={newRoute.to}
                onChange={(e) => setNewRoute({ ...newRoute, to: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              <button onClick={handleAddRoute} className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors whitespace-nowrap">
                Add Route
              </button>
            </div>
            {routeError && <p className="text-red-500 text-xs mt-2">{routeError}</p>}
            {routeMsg && <p className="text-green-600 text-xs mt-2 font-medium">{routeMsg}</p>}
          </div>

          {/* Routes table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Route', 'Buses', 'Bookings', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {routesLoading ? (
                    <tr><td colSpan={5} className="text-center py-10">
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td></tr>
                  ) : routes.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.from} → {r.to}</td>
                      <td className="px-4 py-3 text-gray-600">{r.busCount}</td>
                      <td className="px-4 py-3 text-gray-600">{r.bookingCount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleRoute(r._id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
                              ${r.isActive ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                            {r.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteRoute(r._id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BUSES TAB ── */}
      {tab === 'buses' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {busMsg && <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 border-b border-green-100 font-medium">{busMsg}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Bus Name', 'Route', 'Departure', 'Arrival', 'Seats', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {busesLoading ? (
                  <tr><td colSpan={8} className="text-center py-10">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td></tr>
                ) : buses.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No buses found</td></tr>
                ) : buses.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.route?.from} → {b.route?.to}</td>
                    <td className="px-4 py-3 text-gray-600">{b.departureTime}</td>
                    <td className="px-4 py-3 text-gray-600">{b.arrivalTime}</td>
                    <td className="px-4 py-3 text-gray-600">{b.totalSeats}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₦{b.pricePerSeat?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openBusForm(b)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteBus(b._id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bus form modal */}
      {showBusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
              <button onClick={() => setShowBusForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bus Company Name</label>
                <input type="text" placeholder="e.g. GUO Transport" value={busForm.name}
                  onChange={(e) => setBusForm({ ...busForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Route</label>
                <select value={busForm.routeId} onChange={(e) => setBusForm({ ...busForm, routeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <option value="">Select route</option>
                  {activeRoutes.map((r) => (
                    <option key={r._id} value={r._id}>{r.from} → {r.to}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Departure Time</label>
                  <input type="time" value={busForm.departureTime} onChange={(e) => setBusForm({ ...busForm, departureTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Time</label>
                  <input type="time" value={busForm.arrivalTime} onChange={(e) => setBusForm({ ...busForm, arrivalTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Seats</label>
                  <input type="number" placeholder="45" value={busForm.totalSeats}
                    onChange={(e) => setBusForm({ ...busForm, totalSeats: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Seat (₦)</label>
                  <input type="number" placeholder="9000" value={busForm.pricePerSeat}
                    onChange={(e) => setBusForm({ ...busForm, pricePerSeat: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
                </div>
              </div>
            </div>

            {busError && <p className="text-red-500 text-xs mt-3">{busError}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBusForm(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveBus} className="flex-1 bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors">
                {editingBus ? 'Save Changes' : 'Add Bus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
