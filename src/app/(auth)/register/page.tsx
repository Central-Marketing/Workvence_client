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
import './Register.scss';
import { useUserStore } from '@/store/userStore';

import Swal from 'sweetalert2';

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    setLoading(true);
    try {
      const { url } = image ? await generateImageURL(image) : { url: "" };
      const { data } = await axiosFetch.post('/auth/register', { ...formInput, image: url });
      toast.success('Registration successful! Please confirm your email.');
      setLoading(false);
      setStep(3); // Go to OTP confirmation step
    }
    catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.response?.data?.message || "Registration failed",
        confirmButtonColor: '#6ad724'
      });
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
        
        Swal.fire({
          icon: 'success',
          title: 'Welcome to Workvence!',
          text: 'Your email is verified and you are now logged in.',
          confirmButtonColor: '#6ad724'
        }).then(() => {
          router.push('/');
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Email Verified!',
          text: 'Your email has been verified successfully. Please log in.',
          confirmButtonColor: '#6ad724'
        }).then(() => {
          router.push('/login');
        });
      }
      
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.response?.data?.message || "OTP verification failed",
        confirmButtonColor: '#6ad724'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Request Blocked',
        text: err.response?.data?.message || "Failed to resend OTP",
        confirmButtonColor: '#6ad724'
      });
    }
  }

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

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="left-pane">
          {step === 1 ? (
            <div className="auth-options">
              <div className="logo-container">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
              </div>

              <div className="auth-content">
                <h1>Create a new account</h1>

                <div className="buttons-group">
                  <button className="auth-btn">
                    <FcGoogle className="btn-icon" /> Continue with Google
                  </button>
                  <button className="auth-btn" onClick={() => setStep(2)}>
                    <MdEmail className="btn-icon email-icon" color="#ea4335" /> Continue with Email
                  </button>

                  <div className="divider">
                    <span>Or log in with</span>
                  </div>

                  <div className="social-row">
                    <button className="auth-btn small">
                      <FaApple className="btn-icon apple-icon" /> Continue with Apple
                    </button>
                    <button className="auth-btn small">
                      <FaFacebook className="btn-icon fb-icon" color="#1877F2" /> Continue with Facebook
                    </button>
                  </div>
                </div>

                <div className="auth-footer">
                  <p>Already have an account? <Link href='/login' className="login-link">Sign in</Link></p>
                  <p className="copyright">©2026 workvence All right reserved</p>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="email-form">
              <div className="logo-container-step2">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
              </div>
              <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
              
              <form onSubmit={handleSubmit}>
                <div className="form-fields">
                  <h1>Continue with email</h1>
                  <p className="subtext">Continue with your email and choose a unique username. This is how you'll appear to other users across the platform.</p>

                  <div className="account-type-toggle mb-5 mt-2 flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${!formInput.isSeller ? 'border-brand-green bg-[#eaf8f0] text-[#169c5e]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="isSeller" checked={!formInput.isSeller} onChange={() => setFormInput({...formInput, isSeller: false})} className="hidden" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span className="font-semibold text-[14px]">I'm a Client</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formInput.isSeller ? 'border-brand-green bg-[#eaf8f0] text-[#169c5e]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="isSeller" checked={formInput.isSeller} onChange={() => setFormInput({...formInput, isSeller: true})} className="hidden" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      <span className="font-semibold text-[14px]">I'm a Freelancer</span>
                    </label>
                  </div>

                  <div className="input-group">
                    <label>User name</label>
                    <input name="username" type="text" placeholder="Enter your user name" onChange={handleChange} />
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <input name="email" type="email" placeholder="Enter your email address" onChange={handleChange} />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="password-input-wrapper">
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="***********" onChange={handleChange} />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="password-requirements">
                    <div className={`req-item ${hasMinLength ? 'met' : ''}`}>
                      <AiOutlineCheckCircle className="req-icon" /> At least 8 characters
                    </div>
                    <div className={`req-item ${hasUpperCase ? 'met' : ''}`}>
                      <AiOutlineCheckCircle className="req-icon" /> At least 1 uppercase letter
                    </div>
                    <div className={`req-item ${hasLowerCase ? 'met' : ''}`}>
                      <AiOutlineCheckCircle className="req-icon" /> At least 1 lowercase letter
                    </div>
                    <div className={`req-item ${hasNumber ? 'met' : ''}`}>
                      <AiOutlineCheckCircle className="req-icon" /> At least 1 number
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Loading...' : 'Continue'}</button>
                </div>
              </form>
              <div className="auth-footer-step2">
                <p className="copyright">©2026 workvence All right reserved</p>
              </div>
            </div>
          ) : (
            <div className="email-form otp-form">
              <div className="logo-container-step2">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
              </div>
              <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
              
              <form onSubmit={handleOtpSubmit}>
                <div className="form-fields">
                  <h1>Confirm your email</h1>
                  <p className="subtext text-gray-500 mb-6">We've sent a 6-digit code to <strong>{formInput.email}</strong>. Please enter it below.</p>
                  
                  <div className="otp-inputs flex gap-2 justify-center mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        className="otp-box w-12 h-14 text-center text-xl font-bold border rounded-lg focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  
                  <div className="resend-text text-center mb-6 text-sm">
                    <span className="resend-label text-gray-500">Didn't receive the code?</span>{' '}
                    <button 
                      type="button" 
                      onClick={handleResendOtp} 
                      disabled={resendTimer > 0}
                      className={`font-bold transition-colors ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-green hover:underline cursor-pointer'}`}
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button type="submit" className="submit-btn w-full bg-brand-green text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              </form>
              <div className="auth-footer-step2 mt-8 text-center text-xs text-gray-400">
                <p className="copyright">©2026 workvence All right reserved</p>
              </div>
            </div>
          )}
        </div>

        <div className="right-pane">
          <img src="/loginImg.jpg" alt="Workvence user" className="cover-image" />
          <div className="testimonial-overlay">
            <p>"Betopia has revolutionized how I outsource my business tasks. It's incredibly efficient, and the talent pool is unmatched. A game-changer for my startup!"</p>
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
