"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
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

  useEffect(() => {
    window.scrollTo(0, 0);

    // If user is already authenticated, immediately navigate to safe redirect target
    const currentUser = useUserStore.getState().user || (() => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) return JSON.parse(stored);
        const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
        if (match && match[1]) return JSON.parse(decodeURIComponent(match[1]));
      } catch {}
      return null;
    })();

    if (currentUser) {
      const rawRedirect = searchParams?.get('redirect');
      let target = rawRedirect || '/dashboard';
      if (target) {
        try { target = decodeURIComponent(target); } catch {}
        if (target.includes('%')) {
          try { target = decodeURIComponent(target); } catch {}
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
        try { localStorage.setItem('accessToken', token); } catch {}
        try { localStorage.setItem('token', token); } catch {}
      }
      if (refreshToken) {
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
        try { localStorage.setItem('refreshToken', refreshToken); } catch {}
      }

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Properly decode redirect parameter (handles %2Fsupport%2Fnew)
      const rawRedirect = searchParams?.get('redirect');
      let target = rawRedirect || '/dashboard';
      if (target) {
        try { target = decodeURIComponent(target); } catch {}
        if (target.includes('%')) {
          try { target = decodeURIComponent(target); } catch {}
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 box-border p-4 md:p-10">
      <div className="flex w-full max-w-[1200px] min-h-[600px] md:h-[800px] bg-white rounded-[20px] overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col relative p-6 md:p-10 lg:px-20">
          <div className="flex flex-col h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-7 flex justify-center md:justify-start">
              <Link href="/">
                <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
              </Link>
            </div>

            <div className="flex justify-center md:justify-start w-full">
              <button
                type="button"
                className="self-start bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500 transition-colors"
                onClick={() => router.back()}
              >
                ← Back
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col items-start w-full max-w-[450px] m-0">
              <div className="w-full flex flex-col gap-5">
                <h1 className="text-[28px] font-bold mb-1 text-[#1a1a1a]">Continue with Email</h1>

                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[15px] font-semibold text-[#333]">Email Address</label>
                  <input
                    name="username"
                    type="text"
                    placeholder="Enter your email address"
                    value={formInput.username}
                    onChange={handleFormInput}
                    className="w-full p-3.5 border border-[#e0e0e0] rounded-lg text-[15px] bg-white transition-colors focus:outline-none focus:border-emerald-500 box-border"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[15px] font-semibold text-[#333]">Password</label>
                  <div className="relative flex items-center w-full">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="***********"
                      value={formInput.password}
                      onChange={handleFormInput}
                      className="w-full p-3.5 pr-11 border border-[#e0e0e0] rounded-lg text-[15px] bg-white transition-colors focus:outline-none focus:border-emerald-500 box-border"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center justify-center w-4 h-4 bg-red-400 text-white rounded-full text-[11px] font-bold">!</div>
                      <span className="text-red-400 text-[13px]">{error}</span>
                    </div>
                  )}

                  <div className="self-end mt-1">
                    <Link href="/forgot-password" className="text-[13px] text-[#999] hover:underline hover:text-[#666] transition-colors">
                      Forgot password
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-5 bg-black text-white p-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-brand-green disabled:bg-[#71cfb2] disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-auto pt-10 text-left w-full">
              <p className="mb-4 text-sm text-gray-600 text-center md:text-left">
                Don't have an account? <Link href="/register" prefetch={false} className="text-brand-green font-semibold hover:underline">Sign up</Link>
              </p>
              <p className="text-[13px] text-[#aaa] text-center md:text-left">©2026 workvence All right reserved</p>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="hidden md:flex flex-1 relative bg-black">
          <Image fill priority src="/loginImg.jpg" alt="Workvence user" className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-white text-lg leading-relaxed font-medium [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              "Workvence has revolutionized how I outsource my business tasks. It's incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div className="login-container p-10 flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
