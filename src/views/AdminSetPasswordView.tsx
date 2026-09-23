import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminSetPasswordView = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/set-initial-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (e) {
      setError('Connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-[#0B192C]">Admin Password Setup</h2>
        {success && <p className="text-green-600 mb-4 font-bold">Password successfully created. Redirecting...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Administrative Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl" />
          </div>
          <button type="submit" className="w-full p-3 bg-[#0B192C] text-white rounded-xl font-bold hover:bg-[#1e3a5f] transition-colors">Set Password</button>
        </form>
      </div>
    </div>
  );
};
