"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { Button } from '@/components/ui';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowRight } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineEmail } from 'react-icons/md';
import Image from 'next/image';

import { FaApple } from 'react-icons/fa';

const LoginForm = () => {
  const {
    loadingProvider,
    handleGoogleLogin,
    handleAppleLogin,
    renderGoogleButton,
  } = useSocialAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [formInput, setFormInput] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);

    // If user is already authenticated, immediately navigate to safe redirect target
    const currentUser = useUserStore.getState().user || (() => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) return JSON.parse(stored);
        const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
        if (match && match[1]) return JSON.parse(decodeURIComponent(match[1]));
      } catch { }
      return null;
    })();

    if (currentUser) {
      const rawRedirect = searchParams?.get('redirect');
      let target = rawRedirect || '/dashboard';
      if (target) {
        try { target = decodeURIComponent(target); } catch { }
        if (target.includes('%')) {
          try { target = decodeURIComponent(target); } catch { }
        }
      }
      const safe = (target && target.startsWith('/') && !target.startsWith('/login') && !target.startsWith('/register'))
        ? target
        : '/dashboard';
      window.location.href = safe;
    }
  }, [searchParams]);

  useEffect(() => {
    if (googleBtnRef.current) {
      renderGoogleButton(googleBtnRef.current);
    }
  }, [renderGoogleButton]);

  const handleFormInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formInput.username === '' || formInput.password === '') {
      toast.error('Please fill all input fields');
      return;
    }

    setLoading(true);
    setError(null);

    const identifier = formInput.username.trim();
    const payload = {
      email: identifier,
      password: formInput.password
    };

    try {
      const { data } = await axiosFetch.post('/auth/login', payload);
      const user = data?.user || data;
      const userKey = user.id || user._id || user.username || "default";
      sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
      sessionStorage.removeItem("kyc_prompt_dismissed_session");

      // Save session tokens into cookies and localStorage
      const token = data?.accessToken || data?.token || user?.token || user?.accessToken;
      const refreshToken = data?.refreshToken || user?.refreshToken;
      if (token) {
        document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        try { localStorage.setItem('accessToken', token); } catch { }
        try { localStorage.setItem('token', token); } catch { }
      }
      if (refreshToken) {
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
        try { localStorage.setItem('refreshToken', refreshToken); } catch { }
      }

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Properly decode redirect parameter (handles %2Fsupport%2Fnew)
      const rawRedirect = searchParams?.get('redirect');
      let target = rawRedirect || '/dashboard';
      if (target) {
        try { target = decodeURIComponent(target); } catch { }
        if (target.includes('%')) {
          try { target = decodeURIComponent(target); } catch { }
        }
      }
      const safeTarget = (target && target.startsWith('/') && !target.startsWith('/login') && !target.startsWith('/register'))
        ? target
        : '/dashboard';

      window.location.href = safeTarget;
      setLoading(false);
      return;
    } catch (apiErr: any) {
      const isVerified = apiErr.response?.data?.isVerified;
      const email = apiErr.response?.data?.email;
      const message = apiErr.response?.data?.message || 'Invalid email or password';

      if (isVerified === false && email) {
        toast.error(message || 'Email verification required. Redirecting to OTP step...');
        sessionStorage.setItem('tempLoginPassword', formInput.password);
        sessionStorage.setItem('tempLoginUsername', formInput.username);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        setLoading(false);
        return;
      }

      setError(message);
      toast.error(message, {
        duration: 3000,
      });
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
              width={209}
              height={44}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <p className="text-[14px] text-[#6b7280] mb-2 text-center">
            Do not have an account?{' '}
            <Link href="/register" className="text-[#0D6D5F] font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] mb-7 text-center tracking-tight">
            Sign in to your account
          </h1>

          {/* Social Buttons (2-column grid) */}
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="relative">
              <button
                data-testid="login-google-btn"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading || !!loadingProvider}
                className="w-full h-10 px-3 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium text-[#1f2937] shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'google' ? (
                  <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                ) : (
                  <FcGoogle className="text-lg shrink-0" />
                )}
                <span className="truncate">Continue with Google</span>
              </button>
              <div
                ref={googleBtnRef}
                className="absolute inset-0 overflow-hidden opacity-[0.0001] cursor-pointer pointer-events-auto [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!scale-150"
              />
            </div>

            <button
              data-testid="login-apple-btn"
              type="button"
              onClick={() => handleAppleLogin()}
              // disabled={loading || !!loadingProvider}
              disabled={true}
              className="h-10 px-3 cursor-not-allowed border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium text-[#1f2937] shadow-2xs  disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'apple' ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              ) : (
                <FaApple className="text-lg text-black shrink-0" />
              )}
              <span className="truncate">Continue with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center w-full mb-6">
            <div className="w-full border-t border-gray-200/80" />
            <span className="absolute px-3 bg-[#f8f9fa] text-xs text-gray-500 font-normal">
              or
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleFormSubmit} className="flex flex-col w-full">
            <div className="flex flex-col gap-4 w-full">
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Email</label>
                <input
                  data-testid="login-username-input"
                  name="username"
                  type="text"
                  placeholder="e.g name@email.com"
                  value={formInput.username}
                  onChange={handleFormInput}
                  required
                  className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-[13px] font-medium text-gray-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gray-500 hover:text-[#0D6D5F] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    data-testid="login-password-input"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Set Password"
                    value={formInput.password}
                    onChange={handleFormInput}
                    required
                    className="w-full h-10 px-3.5 pr-11 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <AiOutlineEyeInvisible className="text-lg" /> : <AiOutlineEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Inline Error */}
              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium">
                  <div className="flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold shrink-0">
                    !
                  </div>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                data-testid="login-submit-btn"
                type="submit"
                disabled={loading}
                className="mt-1 w-full h-10 bg-black hover:bg-gray-900 text-white font-medium rounded-[6px] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <AiOutlineArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Disclaimer Note */}
          <p className="mt-6 text-center text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            By joining, you agree to the Workvence{' '}
            <Link href="/trust-safety" className="text-[#0D6D5F] underline font-medium hover:text-[#0b5c50]">
              Terms of Service
            </Link>{' '}
            and to occasionally receive emails from us. Please read our{' '}
            <Link href="/trust-safety" className="text-[#0D6D5F] underline font-medium hover:text-[#0b5c50]">
              Privacy Policy
            </Link>{' '}
            to learn how we use your personal data.
          </p>
        </div>

        {/* Bottom Footer Copyright */}
        <div className="w-full flex justify-start text-[13px] text-[#6b7280] font-normal pt-4">
          <p>© 2026 workvence All right reserved</p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="hidden lg:flex flex-1 p-3 sm:p-4 lg:p-5 h-screen sticky top-0">
        <div className="relative w-full h-full rounded-[6px] lg:rounded-[6px] overflow-hidden bg-[#0a0f1d] shadow-sm">
          <Image
            src="/images/auth/loginImage.png"
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

const Login = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
