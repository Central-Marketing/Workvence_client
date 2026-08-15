"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { axiosFetch } from '@/utils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axiosFetch.post('/auth/forgot-password', { email });

      toast.success("Password reset OTP sent to your email!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send reset link");
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 md:p-10 box-border">
      <div className="flex w-full max-w-[1200px] md:h-[800px] bg-white rounded-2xl overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col p-6 md:p-10 lg:px-20 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          <div className="flex flex-col h-full">
            <div className="flex justify-center md:justify-start mb-7">
              <Link href="/">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="h-10 object-contain" />
              </Link>
            </div>
            <div className="flex justify-center md:justify-start w-full">
              <button className="bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500" onClick={() => router.back()}>← Back</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-start w-full max-w-[450px]">
              <div className="w-full flex flex-col gap-4">
                <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Forgot Password</h1>
                <p className="text-sm text-[#666] leading-relaxed">Enter the email address associated with your account and we'll send you a verification code to reset your password.</p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#333]">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    className="py-3 px-3 border border-gray-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500 w-full"
                  />
                </div>
                {
                  error && <p className="text-sm text-red-500">{error}</p>
                }

                <button type="submit" className="mt-2 bg-emerald-500 text-white py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed w-full" disabled={loading}>
                  {loading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            </form>

            <div className="mt-auto pt-10 text-left w-full">
              <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="hidden md:flex flex-1 relative bg-black">
          <img src="/loginImg.jpg" alt="Workvence user" className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-white text-lg leading-relaxed font-medium drop-shadow-lg">"Workvence has revolutionized how I outsource my business tasks. It's incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
