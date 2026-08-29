"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch, generateImageURL } from '@/utils';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineEmail } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle } from 'react-icons/ai';
import { useUserStore } from '@/store/userStore';
import Image from 'next/image';

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state: any) => state.setUser);

  const initialStep = searchParams.get('step') ? Number(searchParams.get('step')) : 1;
  const initialEmail = searchParams.get('email') || "";
  const isSellerParam = searchParams.get('seller') === 'true';

  const [step, setStep] = useState(initialStep);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formInput, setFormInput] = useState({
    username: "",
    email: initialEmail,
    password: "",
    phone: '',
    description: '',
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const requiredFields = ['username', 'email', 'password'];
    for (let key of requiredFields) {
      if ((formInput as any)[key] === '') {
        toast.error('Please fill all input field: ' + key);
        return;
      }
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
      const { url } = image ? await generateImageURL(image) : { url: "" };
      await axiosFetch.post('/auth/register', { ...formInput, image: url });
      toast.success('Registration successful! Please confirm your email.');
      setLoading(false);
      setStep(3); // Go to OTP confirmation step
    }
    catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  }

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      // POST to verify endpoint
      await axiosFetch.post('/auth/verify-otp', { email: formInput.email, otp: otpValue });

      const loginUsername = formInput.email || sessionStorage.getItem('tempLoginUsername') || formInput.username;
      const loginPassword = formInput.password || sessionStorage.getItem('tempLoginPassword');

      if (loginPassword) {
        // Auto Login
        const { data } = await axiosFetch.post('/auth/login', {
          username: loginUsername,
          password: loginPassword
        });

        const user = data?.user || data;
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        // Clean up temp storage
        sessionStorage.removeItem('tempLoginUsername');
        sessionStorage.removeItem('tempLoginPassword');

        toast.success('Welcome to Workvence! Email verified.');
        router.push('/');
      } else {
        toast.success('Email verified successfully! Please log in.');
        router.push('/login');
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await axiosFetch.post('/auth/resend-otp', { email: formInput.email });
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
      setResendTimer(60);
      toast.success('A new OTP has been sent to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  }

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormInput({
      ...formInput,
      [name]: inputValue
    });
  }

  const hasMinLength = formInput.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formInput.password);
  const hasLowerCase = /[a-z]/.test(formInput.password);
  const hasNumber = /[0-9]/.test(formInput.password);

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const isFormDisabled = loading || !isPasswordValid || usernameStatus.available === false || emailStatus.available === false || usernameStatus.loading || emailStatus.loading;

  return (
    <div className="min-h-screen w-full bg-[#f4f5f6] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Pane */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Header Logo */}
        <div className="w-full flex justify-start">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/Workvence-logo-Horizontal 1.png"
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
              Already have an account?{' '}
              <Link href="/login" className="text-[#008364] font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] mb-8 text-center tracking-tight">
              Create a new account
            </h1>

            <div className="flex flex-col gap-3.5 w-full">
              <button
                data-testid="continue-google-btn"
                type="button"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl text-[14px] font-medium text-[#1f2937] bg-white border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50/80 transition-all cursor-pointer"
              >
                <FcGoogle className="text-[20px]" />
                <span>Continue with Google</span>
              </button>

              <button
                data-testid="continue-email-btn"
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl text-[14px] font-medium text-[#1f2937] bg-white border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50/80 transition-all cursor-pointer"
              >
                <MdOutlineEmail className="text-[20px] text-[#374151]" />
                <span>Continue with Email</span>
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="flex flex-col my-auto w-full max-w-[420px] mx-auto py-8">
            <div className="w-full mb-4">
              <button
                data-testid="back-to-step1-btn"
                type="button"
                className="bg-transparent border-none text-[#6b7280] text-sm font-medium cursor-pointer flex items-center gap-1 hover:text-emerald-600 transition-colors"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-start w-full">
              <div className="w-full flex flex-col gap-4">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-bold text-[#111827] tracking-tight mb-1.5">
                    Continue with email
                  </h1>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    Continue with your email and choose a unique username. This is how you'll appear to other users across the platform.
                  </p>
                </div>

                <div className="flex gap-3 my-1">
                  <label
                    data-testid="role-client-label"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3.5 border rounded-xl cursor-pointer transition-all ${
                      !formInput.isSeller
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      data-testid="role-client-radio"
                      type="radio"
                      name="isSeller"
                      checked={!formInput.isSeller}
                      onChange={() => setFormInput({ ...formInput, isSeller: false })}
                      className="hidden"
                    />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[13px]">I'm a Client</span>
                  </label>

                  <label
                    data-testid="role-freelancer-label"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3.5 border rounded-xl cursor-pointer transition-all ${
                      formInput.isSeller
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      data-testid="role-freelancer-radio"
                      type="radio"
                      name="isSeller"
                      checked={formInput.isSeller}
                      onChange={() => setFormInput({ ...formInput, isSeller: true })}
                      className="hidden"
                    />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-[13px]">I'm a Freelancer</span>
                  </label>
                </div>

                {/* Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">User name</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="username-input"
                      name="username"
                      type="text"
                      placeholder="Enter your user name"
                      onChange={handleChange}
                      value={formInput.username}
                      className={`w-full py-3 px-3.5 pr-10 border rounded-xl text-sm bg-white transition-colors focus:outline-none ${
                        usernameStatus.available === true
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : usernameStatus.available === false
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                    />
                    {usernameStatus.loading && (
                      <div className="absolute right-3 inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  {usernameStatus.message && !usernameStatus.loading && (
                    <p className={`text-xs font-medium mt-0.5 ${usernameStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                      {usernameStatus.available ? '✓ ' : '✕ '} {usernameStatus.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="email-input"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      onChange={handleChange}
                      value={formInput.email}
                      className={`w-full py-3 px-3.5 pr-10 border rounded-xl text-sm bg-white transition-colors focus:outline-none ${
                        emailStatus.available === true
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : emailStatus.available === false
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                    />
                    {emailStatus.loading && (
                      <div className="absolute right-3 inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  {emailStatus.message && !emailStatus.loading && (
                    <p className={`text-xs font-medium mt-0.5 ${emailStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                      {emailStatus.available ? '✓ ' : '✕ '} {emailStatus.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="password-input"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="***********"
                      onChange={handleChange}
                      className="w-full py-3 px-3.5 pr-11 border border-gray-200 rounded-xl text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                </div>

                {/* Criteria Checklist */}
                <div className="grid grid-cols-2 gap-1.5 my-1">
                  <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[14px]" /> At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${hasUpperCase ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[14px]" /> 1 uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${hasLowerCase ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[14px]" /> 1 lowercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                    <AiOutlineCheckCircle className="text-[14px]" /> 1 number
                  </div>
                </div>

                <button
                  data-testid="signup-submit-btn"
                  type="submit"
                  className="mt-2 w-full bg-emerald-600 text-white py-3.5 border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed shadow-sm"
                  disabled={isFormDisabled}
                >
                  {loading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 3: OTP Verification */
          <div className="flex flex-col my-auto w-full max-w-[420px] mx-auto py-8">
            <div className="w-full mb-4">
              <button
                data-testid="back-to-step2-btn"
                type="button"
                className="bg-transparent border-none text-[#6b7280] text-sm font-medium cursor-pointer flex items-center gap-1 hover:text-emerald-600 transition-colors"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
            </div>

            <form data-testid="otp-form" onSubmit={handleOtpSubmit} className="flex flex-col items-start w-full">
              <div className="w-full flex flex-col gap-4">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-bold text-[#111827] tracking-tight mb-1.5">
                    Confirm your email
                  </h1>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    We've sent a 6-digit code to <strong data-testid="otp-target-email" className="text-gray-900">{formInput.email}</strong>. Please enter it below.
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-3 justify-center w-full my-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      data-testid={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="flex-1 min-w-0 max-w-[52px] aspect-square text-center text-xl sm:text-2xl font-bold border border-gray-200 rounded-xl bg-white transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>

                <div className="text-center w-full text-sm text-[#6b7280]">
                  <span>Didn't receive the code?</span>{' '}
                  <button
                    data-testid="resend-otp-btn"
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`font-semibold transition-colors bg-transparent border-none ${
                      resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:underline cursor-pointer'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  data-testid="verify-email-btn"
                  type="submit"
                  className="w-full mt-2 bg-emerald-600 text-white py-3.5 border-none rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
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

const Register = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
};

export default Register;
