"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { axiosFetch } from '@/utils';
import './ResetPassword.scss';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Assuming a backend endpoint for resetting password
      // await axiosFetch.post('/auth/reset-password', { password: passwords.newPassword });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
          <div className="email-form">
            <div className="logo-container-step2">
              <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
            </div>
            
            <button className="back-btn" onClick={() => router.back()}>← Back</button>
            
            <form onSubmit={handleSubmit}>
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

export default ResetPassword;
