'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { getStoredUser, isLoggedIn, updateProfile, changePassword, setStoredUser } from '../../lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Profile form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    const u = getStoredUser();
    setUser(u);
    setName(u?.name || '');
    setPhone(u?.phone || '');
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!name.trim() || !phone.trim()) {
      setProfileMsg({ text: 'Name and phone are required', type: 'error' });
      return;
    }
    setProfileLoading(true);
    setProfileMsg({ text: '', type: '' });
    try {
      const updated = await updateProfile({ name, phone });
      setStoredUser(updated);
      setUser(updated);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassMsg({ text: 'All fields are required', type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    setPassLoading(true);
    setPassMsg({ text: '', type: '' });
    try {
      await changePassword({ currentPassword, newPassword });
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (n) => n?.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="font-bold text-gray-900 text-base mb-5">Personal Information</h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-gray-400 font-normal">(cannot change)</span></label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full border border-gray-100 rounded-xl px-4 py-3 pl-10 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              />
            </div>
          </div>

          {profileMsg.text && (
            <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {profileMsg.text}
            </div>
          )}

          <button
            onClick={handleUpdateProfile}
            disabled={profileLoading}
            className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-70"
          >
            {profileLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-base mb-5">Change Password</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>

          {passMsg.text && (
            <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${passMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {passMsg.text}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={passLoading}
            className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-800 transition-colors disabled:opacity-70"
          >
            {passLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
