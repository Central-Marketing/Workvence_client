"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { axiosFetch } from '@/utils';
import { Button } from '@/components/ui';
import Image from 'next/image';

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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const errorMessage = errorObj.response?.data?.message || "Failed to send reset link";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 md:p-10 box-border">
      <div className="flex w-full max-w-[1200px] md:h-[800px] bg-white rounded-[6px] overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col p-6 md:p-10 lg:px-20 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          <div className="flex flex-col h-full">
            <div className="flex justify-center md:justify-start mb-7">
              <Link href="/">
                <Image src="/Workvence-logo-Horizontal3.png" alt="Workvence" width={160} height={40} className="h-10 w-auto object-contain" priority />
              </Link>
            </div>
            <div className="flex justify-center md:justify-start w-full">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="self-start mb-7 text-[#666] hover:text-emerald-500 p-0 hover:bg-transparent h-auto"
              >
                ← Back
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-start w-full max-w-[450px]">
              <div className="w-full flex flex-col gap-4">
                <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Forgot Password</h1>
                <p className="text-sm text-[#666] leading-relaxed">Enter the email address associated with your account and we&apos;ll send you a verification code to reset your password.</p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-[13px] font-medium text-gray-700">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                </div>
                {
                  error && <p className="text-sm text-red-500">{error}</p>
                }

                <Button
                  type="submit"
                  variant="brand"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  disabled={loading}
                  isLoading={loading}
                  className="mt-2 text-base font-semibold"
                >
                  Continue
                </Button>
              </div>
            </form>

            <div className="mt-auto pt-10 text-left w-full">
              <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="hidden md:flex flex-1 relative bg-black">
          <Image fill src="/loginImg.jpg" alt="Workvence user" className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-white text-lg leading-relaxed font-medium drop-shadow-lg">&ldquo;Workvence has revolutionized how I outsource my business tasks. It&apos;s incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
