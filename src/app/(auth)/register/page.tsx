"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle, AiOutlineArrowRight } from 'react-icons/ai';
import Image from 'next/image';
import { useSocialAuth } from '@/hooks/useSocialAuth';

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') || "";
  const isSellerParam = searchParams.get('seller') === 'true';

  const {
    loadingProvider,
    handleGoogleLogin,
    handleAppleLogin,
    renderGoogleButton,
  } = useSocialAuth();
  const registerGoogleBtnRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formInput, setFormInput] = useState({
    username: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
    isSeller: isSellerParam,
  });

  const [usernameStatus, setUsernameStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    valid: boolean | null;
    message: string;
  }>({ loading: false, available: null, valid: null, message: '' });

  const [emailStatus, setEmailStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    valid: boolean | null;
    message: string;
  }>({ loading: false, available: null, valid: null, message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (registerGoogleBtnRef.current) {
      renderGoogleButton(registerGoogleBtnRef.current, {
        isSeller: formInput.isSeller,
      });
    }
  }, [renderGoogleButton, formInput.isSeller]);

  // Debounced Username Availability Check (400ms)
  useEffect(() => {
    const rawUser = formInput.username.trim();
    if (!rawUser) {
      setUsernameStatus({ loading: false, available: null, valid: null, message: '' });
      return;
    }

    if (rawUser.length < 3) {
      setUsernameStatus({
        loading: false,
        available: false,
        valid: false,
        message: 'Username must be at least 3 characters long.'
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(rawUser)) {
      setUsernameStatus({
        loading: false,
        available: false,
        valid: false,
        message: 'Only letters, numbers, and underscores allowed.'
      });
      return;
    }

    setUsernameStatus(prev => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosFetch.get(`/auth/check-availability?username=${encodeURIComponent(rawUser)}`);
        const info = data?.data?.username;
        if (info) {
          setUsernameStatus({
            loading: false,
            available: info.available,
            valid: info.valid,
            message: info.message
          });
        }
      } catch (err) {
        setUsernameStatus(prev => ({ ...prev, loading: false }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formInput.username]);

  // Debounced Email Availability Check (400ms)
  useEffect(() => {
    const rawEmail = formInput.email.trim();
    if (!rawEmail) {
      setEmailStatus({ loading: false, available: null, valid: null, message: '' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      setEmailStatus({
        loading: false,
        available: false,
        valid: false,
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setEmailStatus(prev => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosFetch.get(`/auth/check-availability?email=${encodeURIComponent(rawEmail)}`);
        const info = data?.data?.email;
        if (info) {
          setEmailStatus({
            loading: false,
            available: info.available,
            valid: info.valid,
            message: info.message
          });
        }
      } catch (err) {
        setEmailStatus(prev => ({ ...prev, loading: false }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formInput.email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const requiredFields = ['username', 'email', 'password', 'confirmPassword'];
    for (const key of requiredFields) {
      if ((formInput as any)[key] === '') {
        toast.error('Please fill all input field: ' + key);
        return;
      }
    }

    if (formInput.password !== formInput.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (usernameStatus.available === false) {
      toast.error(usernameStatus.message || 'Username is not available');
      return;
    }

    if (emailStatus.available === false) {
      toast.error(emailStatus.message || 'Email is not available');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error('Password must fulfill all criteria (at least 8 characters, 1 uppercase, 1 lowercase, and 1 number).');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerPayload } = formInput;
      await axiosFetch.post('/auth/register', registerPayload);
      toast.success('Registration successful! Please confirm your email.');
      setLoading(false);

      // Store temporary credentials for auto-login after OTP verification
      sessionStorage.setItem('tempLoginUsername', formInput.email || formInput.username);
      sessionStorage.setItem('tempLoginPassword', formInput.password);

      router.push(`/verify-email?email=${encodeURIComponent(formInput.email)}`);
    }
    catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormInput(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  const hasMinLength = formInput.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formInput.password);
  const hasLowerCase = /[a-z]/.test(formInput.password);
  const hasNumber = /[0-9]/.test(formInput.password);
  const passwordsMatch = formInput.password === formInput.confirmPassword && formInput.confirmPassword.length > 0;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const isFormDisabled =
    loading ||
    !isPasswordValid ||
    !passwordsMatch ||
    !formInput.username.trim() ||
    !formInput.email.trim() ||
    usernameStatus.available === false ||
    emailStatus.available === false ||
    usernameStatus.loading ||
    emailStatus.loading;

  return (
    <div className="h-screen w-full bg-[#f8f9fa] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Pane */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-5 sm:p-8 lg:px-10 lg:py-4 xl:px-14 xl:py-5 h-screen overflow-y-auto lg:overflow-hidden">
        {/* Top Header Logo */}
        <div className="w-full flex justify-start shrink-0">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/Workvence-logo-Horizontal3.png"
              alt="Workvence"
              width={209}
              height={44}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-1">
          <p className="text-[14px] text-[#6b7280] mb-2 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0D6D5F] font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] mb-7 text-center tracking-tight">
            Create a new account
          </h1>

          {/* Role Toggle Button (Buyer / Seller) */}
          <div className="w-full mb-2.5">
            <div className="grid grid-cols-2 p-0.5 bg-[#ebeef2] rounded-[6px] gap-1 w-full">
              <button
                type="button"
                data-testid="toggle-buyer-btn"
                onClick={() => setFormInput(prev => ({ ...prev, isSeller: false }))}
                className={`h-10 px-3 text-xs sm:text-[13px] rounded-[5px] transition-all cursor-pointer text-center ${!formInput.isSeller
                  ? 'bg-white text-[#111827] font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
                  }`}
              >
                Join as Buyer
              </button>
              <button
                type="button"
                data-testid="toggle-seller-btn"
                onClick={() => setFormInput(prev => ({ ...prev, isSeller: true }))}
                className={`h-10 px-3 text-xs sm:text-[13px] rounded-[5px] transition-all cursor-pointer text-center ${formInput.isSeller
                  ? 'bg-white text-[#111827] font-semibold shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
                  }`}
              >
                Join as Seller
              </button>
            </div>
          </div>

          {/* Social Buttons (2-column grid matching /login) */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-2.5">
            <div className="relative">
              <button
                data-testid="continue-google-btn"
                type="button"
                onClick={() => handleGoogleLogin({ isSeller: formInput.isSeller })}
                disabled={loading || !!loadingProvider}
                className="w-full h-10 px-2.5 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium text-[#1f2937] shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'google' ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                ) : (
                  <FcGoogle className="text-base shrink-0" />
                )}
                <span className="truncate">Continue with Google</span>
              </button>
              <div
                ref={registerGoogleBtnRef}
                className="absolute inset-0 overflow-hidden opacity-[0.0001] cursor-pointer pointer-events-auto [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!scale-150"
              />
            </div>

            <button
              data-testid="continue-apple-btn"
              type="button"
              onClick={() => handleAppleLogin({ isSeller: formInput.isSeller })}
              // disabled={loading || !!loadingProvider}
              disabled={true}
              className="h-10 px-2.5 cursor-not-allowed border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium text-[#1f2937] shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingProvider === 'apple' ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              ) : (
                <FaApple className="text-base text-black shrink-0" />
              )}
              <span className="truncate">Continue with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center w-full mb-2.5">
            <div className="w-full border-t border-gray-200/80" />
            <span className="absolute px-2.5 bg-[#f8f9fa] text-[11px] text-gray-500 font-normal">
              or
            </span>
          </div>

          {/* Registration Credentials Form */}
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="flex flex-col gap-2 w-full">
              {/* Username Input */}
              {/* <div className="flex flex-col gap-1">
                <label className="text-[12px] sm:text-[12.5px] font-medium text-gray-700">Username</label>
                <div className="relative flex items-center">
                  <input
                    data-testid="username-input"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formInput.username}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3 pr-9 border rounded-[6px] text-xs sm:text-sm bg-white transition-colors focus:outline-none ${
                      usernameStatus.available === true
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : usernameStatus.available === false
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-emerald-500'
                    }`}
                  />
                  {usernameStatus.loading && (
                    <div className="absolute right-3 inline-block w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {usernameStatus.message && !usernameStatus.loading && (
                  <p className={`text-[11px] font-medium mt-0.2 ${usernameStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                    {usernameStatus.available ? '✓ ' : '✕ '} {usernameStatus.message}
                  </p>
                )}
              </div> */}

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Email</label>
                <div className="relative flex items-center">
                  <input
                    data-testid="email-input"
                    name="email"
                    type="email"
                    placeholder="e.g name@email.com"
                    value={formInput.email}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3.5 pr-10 border rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none ${emailStatus.available === true
                      ? 'border-emerald-500 bg-white focus:border-emerald-500'
                      : emailStatus.available === false
                        ? 'border-red-500 bg-white focus:border-red-500'
                        : 'bg-[#F0F0F0] border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white'
                      }`}
                  />
                  {emailStatus.loading && (
                    <div className="absolute right-3.5 inline-block w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {emailStatus.message && !emailStatus.loading && (
                  <p className={`text-[11px] font-medium mt-0.2 ${emailStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                    {emailStatus.available ? '✓ ' : '✕ '} {emailStatus.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Password</label>
                <div className="relative flex items-center">
                  <input
                    data-testid="password-input"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formInput.password}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3.5 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
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

                {/* Criteria Checklist */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 my-0.5">
                  <div className={`flex items-center gap-1 text-[11px] ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[12px]" /> At least 8 chars
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${hasUpperCase ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[12px]" /> 1 uppercase
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${hasLowerCase ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[12px]" /> 1 lowercase
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] ${hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[12px]" /> 1 number
                  </div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Confirm Password</label>
                <div className="relative flex items-center">
                  <input
                    data-testid="confirm-password-input"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={formInput.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full h-10 px-3.5 pr-10 border rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none ${formInput.confirmPassword && formInput.password !== formInput.confirmPassword
                      ? 'border-red-500 bg-white focus:border-red-500'
                      : formInput.confirmPassword && formInput.password === formInput.confirmPassword
                        ? 'border-emerald-500 bg-white focus:border-emerald-500'
                        : 'bg-[#F0F0F0] border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible className="text-base" /> : <AiOutlineEye className="text-base" />}
                  </button>
                </div>
                {formInput.confirmPassword && formInput.password !== formInput.confirmPassword && (
                  <p className="text-[11px] font-medium mt-0.2 text-red-500">
                    ✕ Passwords do not match
                  </p>
                )}
                {formInput.confirmPassword && formInput.password === formInput.confirmPassword && (
                  <p className="text-[11px] font-medium mt-0.2 text-emerald-600">
                    ✓ Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                data-testid="signup-submit-btn"
                type="submit"
                disabled={isFormDisabled}
                className="mt-1 w-full h-10 bg-black hover:bg-gray-900 text-white font-medium rounded-[6px] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-[13px]"
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get Started</span>
                    <AiOutlineArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Disclaimer Note */}
          <p className="mt-3 text-center text-[10.5px] sm:text-[11.5px] text-gray-500 leading-snug">
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
        <div className="w-full flex justify-start text-[11.5px] text-[#6b7280] font-normal pt-1 shrink-0">
          <p>© 2026 workvence All right reserved</p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="hidden lg:flex flex-1 p-3 sm:p-4 lg:p-5 h-screen sticky top-0">
        <div className="relative w-full h-full rounded-[6px] lg:rounded-[6px] overflow-hidden bg-[#0a0f1d] shadow-sm">
          <Image
            src="/images/auth/registerImage.png"
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

const Register = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
};

export default Register;
