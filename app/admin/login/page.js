'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLoginApi, setAdminToken, setAdminUser, isAdminLoggedIn } from '../../../lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn()) router.push('/admin/dashboard');
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) { setError('Both fields are required'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await adminLoginApi({ email, password });
      setAdminToken(data.token);
      setAdminUser(data.admin);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">NaijaBus Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Super Administrator Portal</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-7">
          <h2 className="text-white font-semibold text-base mb-5">Sign in to your account</h2>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="admin@naijabus.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 text-gray-500 hover:text-gray-300">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-500 transition-colors disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          This portal is restricted to authorized administrators only not users.
        </p>
      </div>
    </div>
  );
}
