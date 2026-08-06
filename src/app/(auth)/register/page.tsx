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

const RegisterContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formInput, setFormInput] = useState({
    username: "",
    email: "",
    password: "",
    phone: '',
    description: '',
    isSeller: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (searchParams.get('seller') === 'true') {
      setFormInput(prev => ({ ...prev, isSeller: true }));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    for (let key in formInput) {
      // Don't enforce phone/description if not a seller
      if (!formInput.isSeller && (key === 'phone' || key === 'description')) continue;

      if ((formInput as any)[key] === '' && key !== 'isSeller') {
        toast.error('Please fill all input field: ' + key);
        return;
      }
      else if (key === 'phone' && formInput.isSeller && formInput[key].length < 9) {
        toast.error('Enter valid phone number!');
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
      toast.error(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual OTP verification logic
    toast.success('Email confirmed successfully!');
    router.push('/login');
  }

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
                  
                  <div className="otp-inputs">
                    <input type="text" maxLength={1} className="otp-box" placeholder="7" />
                    <input type="text" maxLength={1} className="otp-box" placeholder="7" />
                    <input type="text" maxLength={1} className="otp-box focused-box" />
                    <input type="text" maxLength={1} className="otp-box" />
                  </div>
                  
                  <div className="resend-text">
                    <span className="resend-label">Resend OTP in</span> <span className="timer">1:00</span>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Loading...' : 'Continue'}</button>
                </div>
              </form>
              <div className="auth-footer-step2">
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
