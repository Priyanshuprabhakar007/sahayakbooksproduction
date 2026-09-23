import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SetPasswordView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin');
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (e) {
      setError('Connection failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Set Admin Password</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border rounded-xl" />
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 border rounded-xl" />
        <button type="submit" className="w-full p-3 bg-[#0B192C] text-white rounded-xl font-bold">Set Password</button>
      </form>
    </div>
  );
};
