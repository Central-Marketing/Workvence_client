"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { axiosFetch } from '@/utils';
import './ForgotPassword.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axiosFetch.post('/auth/forgot-password', { email });
      
      toast.success("Password reset OTP sent to your email!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="login-card">
        <div className="left-pane">
          <div className="email-form">
            <div className="logo-container-step2">
              <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
            </div>
            
            <button className="back-btn" onClick={() => router.back()}>← Back</button>
            
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <h1>Forgot Password</h1>
                
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)} 
                  />
                </div>
                
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            </form>
            
            <div className="auth-footer-step2">
              <p className="copyright">©2026 workvence All right reserved</p>
            </div>
          </div>
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

export default ForgotPassword;
