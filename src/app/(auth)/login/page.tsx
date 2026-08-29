"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.scss';
import Image from 'next/image';

const Login = () => {
  const [formInput, setFormInput] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      // username: identifier,
      email: identifier,
      password: formInput.password
    };

    // 1. Send API request for login authentication
    try {
      const { data } = await axiosFetch.post('/auth/login', payload);
      const user = data?.user || data;
      const userKey = user.id || user._id || user.username || "default";
      sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
      sessionStorage.removeItem("kyc_prompt_dismissed_session");
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.username || 'user'}!`, {
        duration: 3000,
        icon: ""
      });
      router.push('/dashboard');
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
        router.push(`/register?step=3&email=${encodeURIComponent(email)}`);
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
    <div className="login-container p-4 md:p-10">
      <div className="login-card">
        <div className="left-pane p-6 md:p-10 lg:px-20">
          <div className="email-form">
            <div className="logo-container-step2 flex justify-center md:justify-start">
              <Link href="/">
                <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="brand-logo" />
              </Link>
            </div>

            <div className="flex justify-center md:justify-start w-full">
              <button className="back-btn" onClick={() => router.back()}>← Back</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-fields">
                <h1>Continue with Email</h1>

                <div className="input-group">
                  <label>Email Address</label>
                  <input name="username" type="text" placeholder="Enter your email address" value={formInput.username} onChange={handleFormInput} />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="***********" value={formInput.password} onChange={handleFormInput} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>

                  {error && (
                    <div className="inline-error">
                      <div className="error-icon">!</div>
                      <span className="error-text">{error}</span>
                    </div>
                  )}

                  <div className="forgot-password">
                    <Link href="/forgot-password">Forgot password</Link>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Loading...' : 'Continue'}</button>
              </div>
            </form>

            <div className="auth-footer-step2 mt-6 text-center">
              <p className="mb-4 text-sm text-gray-600">
                Don't have an account? <Link href="/register" className="text-brand-green font-semibold hover:underline">Sign up</Link>
              </p>
              <p className="copyright">©2026 workvence All right reserved</p>
            </div>
          </div>
        </div>

        <div className="right-pane">
          <Image fill priority src="/loginImg.jpg" alt="Workvence user" className="cover-image" />
          <div className="testimonial-overlay">
            <p>"Workvence has revolutionized how I outsource my business tasks. It's incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
