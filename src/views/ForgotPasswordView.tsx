import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { forgotPassword, navigate } = useStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.error || 'Failed to process password reset request.');
    }
  };

  return (
    <div id="forgot-password-page" className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B192C] text-[#C5A059] mb-4 shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Enter the email address associated with your reader account and we'll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-950">Instructions Dispatched</p>
                <p className="text-emerald-800 leading-relaxed">{message}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center py-3 px-4 border border-[#0B192C] rounded-xl text-sm font-semibold text-[#0B192C] hover:bg-[#0B192C] hover:text-white transition duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5A059] shadow-lg transition duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sending password reset link...</span>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-xs font-semibold text-[#0B192C] hover:text-[#C5A059] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Remember password? Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
