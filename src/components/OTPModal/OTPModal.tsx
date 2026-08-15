"use client";

import React, { useState } from 'react';
import { Mail, RefreshCw, X } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  email?: string;
  isLoading?: boolean;
  isResending?: boolean;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onClose: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  email,
  isLoading = false,
  isResending = false,
  onVerify,
  onResend,
  onClose,
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    onVerify(otp.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        {/* Mail Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
          <Mail size={26} strokeWidth={2} />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          Verify Email Address
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email || 'your email'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
              className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3.5 px-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 font-medium mt-2 text-left">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-green font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-[#059669] transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
          >
            {isLoading ? 'Verifying Code...' : 'Verify OTP'}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={onResend}
              disabled={isResending || isLoading}
              className="text-brand-green font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
