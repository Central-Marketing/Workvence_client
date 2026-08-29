"use client";

import toast from 'react-hot-toast';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosFetch, generateImageURL } from '@/utils';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineEmail } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle, AiOutlineArrowRight } from 'react-icons/ai';
import Image from 'next/image';

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStep = searchParams.get('step') ? Number(searchParams.get('step')) : 1;
  const initialEmail = searchParams.get('email') || "";
  const isSellerParam = searchParams.get('seller') === 'true';

  const [step, setStep] = useState(initialStep);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formInput, setFormInput] = useState({
    username: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
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

  // Backward compatibility: forward to /verify-email if step 3 is accessed directly
  useEffect(() => {
    if (initialStep === 3) {
      router.replace(`/verify-email?email=${encodeURIComponent(initialEmail)}`);
    }
  }, [initialStep, initialEmail, router]);

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
    for (let key of requiredFields) {
      if ((formInput as any)[key] === '') {
        toast.error('Please fill all input field: ' + key);
        return;
      }
    }

    if (formInput.password !== formInput.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Services and Privacy Policy.');
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
      const { url } = image ? await generateImageURL(image) : { url: "" };
      const { confirmPassword, ...registerPayload } = formInput;
      await axiosFetch.post('/auth/register', { ...registerPayload, image: url });
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
    setFormInput({
      ...formInput,
      [name]: inputValue
    });
  };

  const hasMinLength = formInput.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formInput.password);
  const hasLowerCase = /[a-z]/.test(formInput.password);
  const hasNumber = /[0-9]/.test(formInput.password);
  const passwordsMatch = formInput.password === formInput.confirmPassword && formInput.confirmPassword.length > 0;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const isFormDisabled = loading || !isPasswordValid || !passwordsMatch || !agreeToTerms || usernameStatus.available === false || emailStatus.available === false || usernameStatus.loading || emailStatus.loading;

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col lg:flex-row overflow-x-hidden">
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
        ) : (
          /* Step 2: Account Details */
          <div className="flex flex-col my-auto w-full max-w-[420px] mx-auto py-8">
            <div className="w-full mb-4">
              <button
                data-testid="back-to-step1-btn"
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f3f4f6] text-[#374151] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer border-none"
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
                </div>

                {/* Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-[510] text-[#292929]">Choose a username</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="username-input"
                      name="username"
                      type="text"
                      placeholder="Enter your user name"
                      onChange={handleChange}
                      value={formInput.username}
                      className={`w-full py-3 px-3.5 pr-10 border rounded-xl text-sm bg-white transition-colors focus:outline-none ${usernameStatus.available === true
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
                  <label className="text-base font-[510] text-[#292929]">Email</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="email-input"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      onChange={handleChange}
                      value={formInput.email}
                      className={`w-full py-3 px-3.5 pr-10 border rounded-xl text-sm bg-white transition-colors focus:outline-none ${emailStatus.available === true
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
                  <label className="text-base font-[510] text-[#292929]">Password</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="password-input"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="***********"
                      value={formInput.password}
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

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-[510] text-[#292929]">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input
                      data-testid="confirm-password-input"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="***********"
                      value={formInput.confirmPassword}
                      onChange={handleChange}
                      className={`w-full py-3 px-3.5 pr-11 border rounded-xl text-sm bg-white transition-colors focus:outline-none ${
                        formInput.confirmPassword && formInput.password !== formInput.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : formInput.confirmPassword && formInput.password === formInput.confirmPassword
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 bg-transparent border-none text-[#888] text-xl cursor-pointer flex items-center justify-center p-0 hover:text-[#555]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                  {formInput.confirmPassword && formInput.password !== formInput.confirmPassword && (
                    <p className="text-xs font-medium mt-0.5 text-red-500">
                      ✕ Passwords do not match
                    </p>
                  )}
                  {formInput.confirmPassword && formInput.password === formInput.confirmPassword && (
                    <p className="text-xs font-medium mt-0.5 text-emerald-600">
                      ✓ Passwords match
                    </p>
                  )}
                </div>

                {/* Terms of Services and Privacy Policy Checkbox */}
                <div className="flex items-start gap-2.5 my-1">
                  <input
                    data-testid="terms-checkbox"
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-[#6b7280] leading-relaxed cursor-pointer select-none">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-emerald-600 font-medium hover:underline">
                      Terms of Services
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" className="text-emerald-600 font-medium hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  data-testid="signup-submit-btn"
                  type="submit"
                  className={`mt-2 w-full flex items-center justify-center gap-2 py-3.5 border-none rounded-xl text-sm font-semibold transition-all shadow-sm ${isFormDisabled
                    ? 'bg-[#DADADA] text-[#6E6E6E] cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                    }`}
                  disabled={isFormDisabled}
                >
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>
                      <span>Get Started</span>
                      <AiOutlineArrowRight className="text-base" />
                    </>
                  )}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
};

export default Register;
