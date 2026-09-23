import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    login,
    loginWithPhone,
  } = useStore();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (email || '').trim();
    if (cleanEmail) {
      login(cleanEmail, 'customer');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = (phone || '').trim();
    if (cleanPhone.length >= 10) {
      setIsOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = (otp || '').trim();
    const cleanPhone = (phone || '').trim();
    if (cleanOtp.length >= 4) {
      loginWithPhone(cleanPhone);
    }
  };

  const handleGoogleLogin = () => {
    login('reader.sahayak@gmail.com', 'customer');
  };

  const handleQuickCustomerDemo = () => {
    login('scholar.fellow@sahayak.in', 'customer');
  };

  const handleQuickAdminDemo = () => {
    login('chief.editor@sahayakassociates.org', 'admin');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-[#0B192C] text-[#FAF7F2] rounded-3xl shadow-2xl border border-[#C5A059]/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="close-auth-modal-btn"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 text-center">
          <div className="inline-flex p-2 rounded-xl bg-[#C5A059]/15 text-[#C5A059] mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">
            {authModalTab === 'login' ? 'Sahayak Reader Sign In' : 'Create Reader Account'}
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Access purchased eBooks, track shipments, and curate your scholarly reading list.
          </p>

          {/* Quick Method Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setAuthMethod('email')}
              className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'email'
                  ? 'bg-[#C5A059] text-[#0B192C] shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Access</span>
            </button>
            <button
              onClick={() => setAuthMethod('phone')}
              className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'phone'
                  ? 'bg-[#C5A059] text-[#0B192C] shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {authMethod === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adv. Ramanathan"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Official / Personal Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{authModalTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-3.5">
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/15 bg-white/5 text-stone-400 text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-r-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Enter 4-Digit OTP sent to +91 {phone}</span>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[#C5A059] underline"
                      >
                        Change
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 4 8 2 9"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-center tracking-widest text-lg text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059] font-mono font-bold"
                    />
                    <p className="text-[11px] text-stone-400 mt-1 text-center">
                      Auto-simulation: Enter any 4-digit code (e.g. 1234)
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify & Continue</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Google Sign-in Alternative */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0B192C] px-2 text-stone-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* 1-Click Fast Demo Credentials Buttons */}
          <div className="pt-2 bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#C5A059] font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Quick Demo Sign-In:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCustomerDemo}
                className="py-1.5 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium border border-stone-600 transition-colors flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Demo Reader</span>
              </button>
              <button
                type="button"
                onClick={handleQuickAdminDemo}
                className="py-1.5 px-2.5 rounded-lg bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#C5A059] text-[11px] font-bold border border-[#C5A059]/40 transition-colors flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Switch Tab Footer */}
        <div className="p-4 bg-black/20 text-center text-xs text-stone-400 border-t border-white/10">
          {authModalTab === 'login' ? (
            <span>
              New to Sahayak Books?{' '}
              <button
                onClick={() => openAuthModal('register')}
                className="text-[#C5A059] font-semibold hover:underline"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => openAuthModal('login')}
                className="text-[#C5A059] font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
