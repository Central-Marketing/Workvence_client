"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { AiOutlineArrowRight } from 'react-icons/ai';

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state: any) => state.setUser);

  const email = searchParams.get('email') || "";

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // only numbers allowed
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const numbersOnly = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!numbersOnly) return;

    const newOtp = [...otp];
    for (let i = 0; i < numbersOnly.length; i++) {
      newOtp[i] = numbersOnly[i];
    }
    setOtp(newOtp);

    const targetFocusIndex = Math.min(numbersOnly.length, 5);
    const targetInput = document.getElementById(`otp-${targetFocusIndex}`);
    if (targetInput) targetInput.focus();
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    if (!email) {
      toast.error('No email address provided.');
      return;
    }
    try {
      await axiosFetch.post('/auth/resend-otp', { email });
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
      setResendTimer(60);
      toast.success('A new OTP has been sent to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    if (!email) {
      toast.error('Email address is missing. Please sign up or log in again.');
      return;
    }

    setLoading(true);
    try {
      // POST to verify endpoint
      await axiosFetch.post('/auth/verify-otp', { email, otp: otpValue });

      const loginUsername = email || sessionStorage.getItem('tempLoginUsername');
      const loginPassword = sessionStorage.getItem('tempLoginPassword');

      if (loginPassword && loginUsername) {
        try {
          // Auto Login
          const { data } = await axiosFetch.post('/auth/login', {
            email: loginUsername,
            username: loginUsername,
            password: loginPassword
          });

          const user = data?.user || data;
          const userKey = user.id || user._id || user.username || "default";
          sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
          sessionStorage.removeItem("kyc_prompt_dismissed_session");
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);

          // Clean up temp storage
          sessionStorage.removeItem('tempLoginUsername');
          sessionStorage.removeItem('tempLoginPassword');

          toast.success('Welcome to Workvence! Email verified.');
          router.push('/dashboard');
          return;
        } catch (loginErr) {
          console.warn("Auto-login error after OTP verification:", loginErr);
        }
      }

      toast.success('Email verified successfully! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Pane */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Header Logo */}
        <div className="w-full flex justify-start">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/Workvence-logo-Horizontal3.png"
              alt="Workvence"
              width={145}
              height={36}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Content */}
        <div className="flex flex-col my-auto w-full max-w-[420px] mx-auto py-8">
          <div className="w-full mb-5">
            <button
              data-testid="back-to-register-btn"
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f3f4f6] text-[#374151] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer border-none"
              onClick={() => router.push('/register')}
            >
              ← Back
            </button>
          </div>

          <form data-testid="otp-form" onSubmit={handleOtpSubmit} className="flex flex-col items-start w-full">
            <div className="w-full flex flex-col">
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#111827] tracking-tight mb-6">
                Confirm your email
              </h1>

              <div className="flex gap-2 sm:gap-2.5 justify-start w-full mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    data-testid={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    placeholder="0"
                    className="flex-1 min-w-0 max-w-[56px] aspect-square text-center text-xl sm:text-2xl font-bold border border-gray-200 rounded-2xl bg-[#f9fafb] text-gray-900 placeholder:text-[#868686] placeholder:font-normal placeholder:text-[24px] placeholder:leading-none placeholder:tracking-[0px] font-['SF_Pro',-apple-system,BlinkMacSystemFont,sans-serif] focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              <div className="text-left w-full text-sm text-[#6b7280] mb-5">
                <span>Didn’t receive the email?</span>{' '}
                {resendTimer > 0 ? (
                  <span className="text-gray-900 font-semibold">
                    Retry in <strong className="font-bold">{resendTimer}</strong> seconds
                  </span>
                ) : (
                  <button
                    data-testid="resend-otp-btn"
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Retry
                  </button>
                )}
              </div>

              <button
                data-testid="verify-email-btn"
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className={`w-full flex items-center justify-center gap-2 py-3.5 border-none rounded-xl text-sm font-semibold transition-all shadow-sm ${loading || otp.join('').length < 6
                  ? 'bg-[#DADADA] text-[#6E6E6E] cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                  }`}
              >
                {loading ? (
                  'Verifying...'
                ) : (
                  <>
                    <span>Submit</span>
                    <AiOutlineArrowRight className="text-base" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Footer Copyright */}
        <div className="w-full flex justify-start text-[13px] text-[#6b7280] font-normal pt-6">
          <p>© 2026 workvence All right reserved</p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="hidden lg:flex flex-1 p-3 sm:p-4 lg:p-5 h-screen sticky top-0">
        <div className="relative w-full h-full rounded-2xl lg:rounded-3xl overflow-hidden bg-[#0a0f1d] shadow-sm">
          <Image
            src="/media/loginImage.png"
            alt="Workvence"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
