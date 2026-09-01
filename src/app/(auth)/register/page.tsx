"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch, generateImageURL } from '@/utils';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail } from 'react-icons/md';
import { FaApple, FaFacebook } from 'react-icons/fa';
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
      const { data } = await axiosFetch.post('/auth/register', { ...formInput, image: url });
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 md:p-10 box-border">
      <div className="flex w-full max-w-[1200px] md:h-[800px] bg-white rounded-2xl overflow-hidden">
        {/* Left Pane */}
        <div className="flex-1 flex flex-col p-6 md:p-10 lg:px-20 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          {step === 1 ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-center md:justify-start">
                <Link href="/">
                  <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
                </Link>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center max-w-[450px] mx-auto w-full my-auto py-6">
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#1a1a1a] mb-10 text-center">Create a new account</h1>

                <div className="flex flex-col gap-4 w-full">
                  <button data-testid="continue-google-btn" className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-medium text-[#333] bg-white border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300">
                    <FcGoogle className="text-[22px]" /> Continue with Google
                  </button>
                  <button data-testid="continue-email-btn" className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-medium text-[#333] bg-white border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300" onClick={() => setStep(2)}>
                    <MdEmail className="text-[22px]" color="#ea4335" /> Continue with Email
                  </button>
                </div>

                <div className="mt-14 text-center w-full">
                  <p className="text-sm text-[#666] mb-2">Already have an account? <Link href='/login' className="text-emerald-500 font-semibold no-underline hover:underline">Sign in</Link></p>
                </div>
              </div>

              <div className="text-center w-full pt-4">
                <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-center md:justify-start mb-7">
                <Link href="/">
                  <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
                </Link>
              </div>
              <div className="flex justify-center md:justify-start w-full">
                <button data-testid="back-to-step1-btn" className="bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500" onClick={() => setStep(1)}>← Back</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col items-start w-full max-w-[450px]">
                <div className="w-full flex flex-col gap-4">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Continue with email</h1>
                  <p className="text-sm text-[#666] leading-relaxed">Continue with your email and choose a unique username. This is how you'll appear to other users across the platform.</p>

                  <div className="flex gap-4 mb-3 mt-2">
                    <label data-testid="role-client-label" className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${!formInput.isSeller ? 'border-brand-green bg-[#eaf8f0] text-[#169c5e]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input data-testid="role-client-radio" type="radio" name="isSeller" checked={!formInput.isSeller} onChange={() => setFormInput({ ...formInput, isSeller: false })} className="hidden" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span className="font-semibold text-[14px]">I'm a Client</span>
                    </label>
                    <label data-testid="role-freelancer-label" className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formInput.isSeller ? 'border-brand-green bg-[#eaf8f0] text-[#169c5e]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input data-testid="role-freelancer-radio" type="radio" name="isSeller" checked={formInput.isSeller} onChange={() => setFormInput({ ...formInput, isSeller: true })} className="hidden" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      <span className="font-semibold text-[14px]">I'm a Freelancer</span>
                    </label>
                  </div>

                  {/* Username Input with Debounced Live Status Indicator */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#333]">User name</label>
                    <div className="relative flex items-center">
                      <input
                        data-testid="username-input"
                        name="username"
                        type="text"
                        placeholder="Enter your user name"
                        onChange={handleChange}
                        value={formInput.username}
                        className={`py-3 px-3 pr-10 border rounded-lg text-sm bg-white transition-colors focus:outline-none w-full ${usernameStatus.available === true
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

                  {/* Email Input with Debounced Live Status Indicator */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#333]">Email Address</label>
                    <div className="relative flex items-center">
                      <input
                        data-testid="email-input"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        onChange={handleChange}
                        value={formInput.email}
                        className={`py-3 px-3 pr-10 border rounded-lg text-sm bg-white transition-colors focus:outline-none w-full ${emailStatus.available === true
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#333]">Password</label>
                    <div className="relative flex items-center">
                      <input data-testid="password-input" name="password" type={showPassword ? "text" : "password"} placeholder="***********" onChange={handleChange} className="py-3 px-3 pr-11 border border-gray-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-emerald-500 w-full" />
                      <button type="button" className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555]" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-1">
                    <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? 'text-emerald-500' : 'text-[#999]'}`}>
                      <AiOutlineCheckCircle className="text-[15px]" /> At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${hasUpperCase ? 'text-emerald-500' : 'text-[#999]'}`}>
                      <AiOutlineCheckCircle className="text-[15px]" /> At least 1 uppercase letter
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${hasLowerCase ? 'text-emerald-500' : 'text-[#999]'}`}>
                      <AiOutlineCheckCircle className="text-[15px]" /> At least 1 lowercase letter
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? 'text-emerald-500' : 'text-[#999]'}`}>
                      <AiOutlineCheckCircle className="text-[15px]" /> At least 1 number
                    </div>
                  </div>

                  <button data-testid="signup-submit-btn" type="submit" className="mt-2 bg-emerald-500 text-white py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed" disabled={isFormDisabled}>{loading ? 'Loading...' : 'Continue'}</button>
                </div>
              </form>
              <div className="mt-auto pt-10 pb-4 text-center w-full">
                <p className="text-[13px] text-[#aaa]">©2026 workvence All right reserved</p>
              </div>
            </div>
          ) : (
            /* ── Step 3: OTP Verification ── */
            <div className="flex flex-col h-full">
              <div className="flex justify-center md:justify-start mb-7">
                <Link href="/">
                  <img src="/Workvence-logo-Horizontal3.png" alt="Workvence" className="h-10 object-contain" />
                </Link>
              </div>
              <div className="flex justify-center md:justify-start w-full">
                <button data-testid="back-to-step2-btn" className="bg-transparent border-none text-[#666] text-base cursor-pointer mb-7 flex items-center hover:text-emerald-500" onClick={() => setStep(2)}>← Back</button>
              </div>

              <form data-testid="otp-form" onSubmit={handleOtpSubmit} className="flex flex-col items-start w-full max-w-[450px]">
                <div className="w-full flex flex-col gap-4">
                  <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a]">Confirm your email</h1>
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">We've sent a 6-digit code to <strong data-testid="otp-target-email">{formInput.email}</strong>. Please enter it below.</p>

                  <div className="flex gap-2 sm:gap-3 justify-center w-full mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        data-testid={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="flex-1 min-w-0 max-w-[55px] aspect-square text-center text-xl sm:text-2xl font-bold border border-gray-200 rounded-xl bg-white transition-colors focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                      />
                    ))}
                  </div>

                  <div className="text-center w-full mb-4 text-sm">
                    <span className="text-gray-500">Didn't receive the code?</span>{' '}
                    <button
                      data-testid="resend-otp-btn"
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className={`font-bold transition-colors bg-transparent border-none ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-green hover:underline cursor-pointer'}`}
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button data-testid="verify-email-btn" type="submit" className="w-full bg-emerald-500 text-white py-3.5 border-none rounded-lg text-base font-bold cursor-pointer transition-colors hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              </form>
              <div className="mt-auto pt-10 text-center w-full">
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
  )
}

const Register = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}

export default Register;
