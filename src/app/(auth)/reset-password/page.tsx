"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { axiosFetch } from '@/utils';
import './ResetPassword.scss';

const ResetPasswordContent = () => {
  const [step, setStep] = useState(1);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
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

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    // Just move to the next step to set password
    setStep(2);
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const otpValue = otp.join("");

    setLoading(true);
    try {
      await axiosFetch.post('/auth/reset-password', { 
        email, 
        otp: otpValue, 
        newPassword: passwords.newPassword 
      });
      
      toast.success("Password reset successfully!");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="login-card">
        <div className="left-pane">
          {step === 1 ? (
            <div className="email-form otp-form">
              <div className="logo-container-step2">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
              </div>
              <button className="back-btn" onClick={() => router.back()}>← Back</button>
              
              <form onSubmit={handleVerifyOtp}>
                <div className="form-fields">
                  <h1>Verify OTP</h1>
                  <p className="subtext text-gray-500 mb-6">We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.</p>
                  
                  <div className="otp-inputs flex gap-2 justify-center mb-6" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        className="otp-box"
                        style={{ width: '48px', height: '56px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    Verify OTP
                  </button>
                </div>
              </form>
              
              <div className="auth-footer-step2">
                <p className="copyright">©2026 workvence All right reserved</p>
              </div>
            </div>
          ) : (
            <div className="email-form">
              <div className="logo-container-step2">
                <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
              </div>
              
              <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
              
              <form onSubmit={handleSubmitPassword}>
                <div className="form-fields">
                  <h1>Create New Password</h1>
                  
                  <div className="input-group">
                    <label>New password</label>
                    <div className="password-input-wrapper">
                      <input 
                        name="newPassword" 
                        type={showNewPassword ? "text" : "password"}
                        placeholder="***********" 
                        value={passwords.newPassword}
                        onChange={handleChange} 
                      />
                      <button 
                        type="button" 
                        className="eye-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirm password</label>
                    <div className="password-input-wrapper">
                      <input 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="***********" 
                        value={passwords.confirmPassword}
                        onChange={handleChange} 
                      />
                      <button 
                        type="button" 
                        className="eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                  </button>
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
  );
};

const ResetPassword = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
};

export default ResetPassword;
