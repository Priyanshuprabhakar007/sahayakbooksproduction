import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerifyEmailView: React.FC = () => {
  const { verifyEmail, navigate, currentUser } = useStore();

  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get('token') || '';

  const [inputToken, setInputToken] = useState(token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVerify = async (tokToVerify: string) => {
    if (!tokToVerify) {
      setError('Please provide a valid verification token.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await verifyEmail(tokToVerify);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Email verified successfully!');
    } else {
      setError(result.error || 'Verification failed.');
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  return (
    <div id="verify-email-page" className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B192C] text-[#C5A059] mb-3 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Verify your email address to unlock full account features and order notifications.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-6 text-center">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3.5 text-left">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-950">Verification Complete</p>
                <p className="text-emerald-800 leading-relaxed">{successMessage}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/account')}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] shadow-lg transition duration-200"
            >
              Go to Account Dashboard <ArrowRight className="w-4 h-4 ml-2 text-[#C5A059]" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="verify-token-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Verification Token
              </label>
              <input
                id="verify-token-input"
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Enter verification token"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C5A059] text-sm text-gray-900"
              />
            </div>

            <button
              onClick={() => handleVerify(inputToken)}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#1E3E62] shadow-lg transition duration-200 disabled:opacity-50"
            >
              {isLoading ? <span>Verifying Email...</span> : <span>Confirm Email Verification</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
