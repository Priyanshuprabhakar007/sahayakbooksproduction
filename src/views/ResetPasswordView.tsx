import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export const ResetPasswordView: React.FC = () => {
  const { resetPassword, navigate } = useStore();

  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword({ token, newPassword, confirmPassword });
    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message || 'Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error || 'Password reset failed.');
    }
  };

  return (
    <div id="reset-password-page" className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B192C] text-[#C5A059] mb-4 shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reset-new-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] focus:outline-none shadow-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? <span>Updating Password...</span> : <span>Update Password</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
