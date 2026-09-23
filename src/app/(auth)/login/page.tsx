"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowRight } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineEmail } from 'react-icons/md';
import Image from 'next/image';

const LoginForm = () => {
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
  const initialStep = searchParams?.get('email') ? 2 : 1;
  const [step, setStep] = useState<1 | 2>(initialStep);

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
              width={145}
              height={36}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Form Content */}
        {step === 1 ? (
          <div className="flex flex-col items-center justify-center my-auto w-full max-w-[390px] mx-auto py-8">
            <p className="text-[14px] text-[#6b7280] mb-2 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#008364] font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] mb-8 text-center tracking-tight">
              Sign in to Workvence
            </h1>

            <div className="flex flex-col gap-3.5 w-full">
              {/* <Button
                data-testid="login-google-btn"
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                radius="fiverr"
                leftIcon={<FcGoogle className="text-[20px]" />}
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
                  window.location.href = `${apiUrl}/auth/google`;
                }}
                className="font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50/80"
              >
                Continue with Google
              </Button> */}

              <Button
                data-testid="login-email-btn"
                type="button"
                variant="outline"
                size="md"
                fullWidth
                radius="fiverr"
                leftIcon={<MdOutlineEmail className="text-[20px] text-[#374151]" />}
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                className="font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                Continue with Email
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Account Credentials */
          <div className="flex flex-col my-auto w-full max-w-[420px] mx-auto py-8">
            <div className="w-full mb-4">
              <Button
                data-testid="back-to-step1-btn"
                type="button"
                variant="soft"
                size="xs"
                radius="fiverr"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                className="font-semibold text-[#374151]"
              >
                ← Back
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col items-start w-full">
              <div className="w-full flex flex-col gap-4">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-bold text-[#111827] tracking-tight mb-1.5">
                    Continue with email
                  </h1>
                </div>

                {/* Email or Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-[510] text-[#292929]">Email or Username</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="login-username-input"
                      name="username"
                      type="text"
                      placeholder="Enter your email or username"
                      value={formInput.username}
                      onChange={handleFormInput}
                      required
                      className="w-full py-3 px-3.5 pr-10 border border-gray-200 rounded-[6px] text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-[510] text-[#292929]">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#6b7280] hover:text-emerald-600 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      data-testid="login-password-input"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="***********"
                      value={formInput.password}
                      onChange={handleFormInput}
                      required
                      className="w-full py-3 px-3.5 pr-11 border border-gray-200 rounded-[6px] text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#888] hover:text-[#555] hover:!bg-transparent !p-0 !min-h-0 !h-auto w-auto"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <AiOutlineEyeInvisible className="text-xl" /> : <AiOutlineEye className="text-xl" />}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-[11px] font-bold shrink-0">
                        !
                      </div>
                      <span className="text-red-500 text-xs font-medium">{error}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  data-testid="login-submit-btn"
                  type="submit"
                  variant="dark"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  disabled={loading}
                  isLoading={loading}
                  rightIcon={<AiOutlineArrowRight className="text-base" />}
                  className="mt-2 font-semibold shadow-sm"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Bottom Footer Copyright */}
        <div className="w-full flex justify-start text-[13px] text-[#6b7280] font-normal pt-6">
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
