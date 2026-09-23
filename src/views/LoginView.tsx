import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginCustomer, navigate, currentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract returnTo from URL if redirected
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const rawReturnTo = urlParams.get('returnTo');
  // Validate returnTo starts with / to prevent open redirect vulnerabilities
  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') ? rawReturnTo : '/account';

  // If already logged in, redirect
  if (currentUser) {
    setTimeout(() => {
      navigate(returnTo);
    }, 100);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await loginCustomer({ email, password, rememberMe });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Login successful. Redirecting...');
      setTimeout(() => {
        navigate(returnTo);
      }, 800);
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE] relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B192C] text-[#C5A059] mb-4 shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Sign in to access your saved books, order history, and personal library.
          </p>
        </div>

        {error && (
          <div id="login-error-alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div id="login-success-alert" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  id="login-forgot-password-link"
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-medium text-[#C5A059] hover:text-[#0B192C] transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400 transition"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#0B192C] focus:ring-[#C5A059] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700 cursor-pointer">
                Remember me on this device
              </label>
            </div>
          </div>

          <div>
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5A059] shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in securely...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Reader Account <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account yet?{' '}
            <button
              id="login-register-link"
              onClick={() => navigate(`/register${rawReturnTo ? `?returnTo=${encodeURIComponent(rawReturnTo)}` : ''}`)}
              className="font-bold text-[#0B192C] hover:text-[#C5A059] underline transition"
            >
              Create Account
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
          <Shield className="w-4 h-4 text-[#C5A059]" />
          <span>256-bit Encrypted Reader Security</span>
        </div>
      </div>
    </div>
  );
};
