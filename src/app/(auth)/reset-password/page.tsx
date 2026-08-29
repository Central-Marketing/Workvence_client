"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { axiosFetch } from '@/utils';
import Image from 'next/image';

const ResetPasswordContent = () => {
  const [step, setStep] = useState(1);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setStep(2);
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const otpValue = otp.join("");

    setLoading(true);
    try {
      await axiosFetch.post('/auth/reset-password', {
        email,
        otp: otpValue,
        newPassword: passwords.newPassword
      });

      toast.success("Password reset successfully!");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 md:p-10 box-border">
      <div className="flex w-full max-w-[1200px] md:h-[800px] bg-white rounded-2xl overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col p-6 md:p-10 lg:px-20 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          {step === 1 ? (
            /* ── Step 1: OTP Verification ── */
            <div className="flex flex-col h-full">
              <div className="flex justify-center md:justify-start mb-7">
                <Link href="/">
                  <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
                </Link>
              </div>
              <div className="flex justify-center md:justify-start w-full">
                <button className="bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500" onClick={() => router.back()}>← Back</button>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col items-start w-full max-w-[450px]">
                <div className="w-full flex flex-col gap-4">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Verify OTP</h1>
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.</p>

                  <div className="flex gap-2 sm:gap-3 justify-center w-full mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="flex-1 min-w-0 max-w-[55px] aspect-square text-center text-xl sm:text-2xl font-bold border border-gray-200 rounded-xl bg-white transition-colors focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  <button type="submit" className="w-full bg-emerald-500 text-white py-3.5 border-none rounded-lg text-base font-bold cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed" disabled={loading}>
                    Verify OTP
                  </button>
                </div>
              </form>

              <div className="mt-auto pt-10 text-left w-full">
                <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
              </div>
            </div>
          ) : (
            /* ── Step 2: New Password ── */
            <div className="flex flex-col h-full">
              <div className="flex justify-center md:justify-start mb-7">
                <Link href="/">
                  <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
                </Link>
              </div>
              <div className="flex justify-center md:justify-start w-full">
                <button className="bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500" onClick={() => setStep(1)}>← Back</button>
              </div>

              <form onSubmit={handleSubmitPassword} className="flex flex-col items-start w-full max-w-[450px]">
                <div className="w-full flex flex-col gap-4">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Create New Password</h1>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#333]">New password</label>
                    <div className="relative flex items-center">
                      <input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="***********"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        className="py-3 px-3 pr-11 border border-gray-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500 w-full"
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555]"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#333]">Confirm password</label>
                    <div className="relative flex items-center">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="***********"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                        className="py-3 px-3 pr-11 border border-gray-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500 w-full"
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555]"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="mt-2 w-full bg-emerald-500 text-white py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                  </button>
                </div>
              </form>

              <div className="mt-auto pt-10 text-left w-full">
                <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane */}
        <div className="hidden md:flex flex-1 relative bg-black">
          <Image fill src="/loginImg.jpg" alt="Workvence user" className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-white text-lg leading-relaxed font-medium drop-shadow-lg">"Workvence has revolutionized how I outsource my business tasks. It's incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResetPassword = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
};

export default ResetPassword;
