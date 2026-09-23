import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, Shield, ArrowRight, BookOpen } from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { registerCustomer, navigate, currentUser } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const rawReturnTo = urlParams.get('returnTo');
  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') ? rawReturnTo : '/account';

  if (currentUser) {
    setTimeout(() => {
      navigate(returnTo);
    }, 100);
  }

  // Password rules validation check
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!hasMinLen || !hasUpper || !hasLower || !hasNum) {
      setError('Password does not meet requirements (minimum 8 characters, 1 uppercase, 1 lowercase, and 1 number).');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    const result = await registerCustomer({
      name,
      email,
      phone,
      password,
      confirmPassword,
      agreeToTerms,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate(returnTo);
      }, 1000);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div id="register-page" className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B192C] text-[#C5A059] mb-3 shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
            Create Reader Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Join Sahayak Associates to save books, track shipments, and access reader benefits.
          </p>
        </div>

        {error && (
          <div id="register-error-alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div id="register-success-alert" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Vardhan"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                <span className={`flex items-center gap-1 ${hasMinLen ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLen ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  8+ Characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUpper ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLower ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1 ${hasNum ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNum ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  Number (0-9)
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-gray-900 placeholder-gray-400"
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

          <div className="flex items-start pt-1">
            <div className="flex items-center h-5">
              <input
                id="reg-terms"
                type="checkbox"
                required
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-[#0B192C] focus:ring-[#C5A059] border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div className="ml-2.5 text-xs text-gray-600">
              I agree to Sahayak Associates{' '}
              <a href="#/privacy" className="text-[#0B192C] underline font-medium hover:text-[#C5A059]">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#/terms" className="text-[#0B192C] underline font-medium hover:text-[#C5A059]">
                Terms of Service
              </a>
              .
            </div>
          </div>

          <div className="pt-2">
            <button
              id="register-submit-btn"
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <button
              id="register-login-link"
              onClick={() => navigate(`/login${rawReturnTo ? `?returnTo=${encodeURIComponent(rawReturnTo)}` : ''}`)}
              className="font-bold text-[#0B192C] hover:text-[#C5A059] underline transition"
            >
              Sign In Instead
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
          <Shield className="w-4 h-4 text-[#C5A059]" />
          <span>Your data is protected under strict privacy safeguards</span>
        </div>
      </div>
    </div>
  );
};
