"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { axiosFetch } from '@/utils';
import { useUserStore } from '@/store/userStore';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.scss';

const Login = () => {
  const [formInput, setFormInput] = useState({
    username: 'buyer2',
    password: 'password123'
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

    const payload = {
      username: formInput.username,
      password: formInput.password
    };

    // 1. Send API request for login authentication
    try {
      const { data } = await axiosFetch.post('/auth/login', payload);
      const user = data?.user || data;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.username || 'user'}!`, {
        duration: 3000,
        icon: "😃"
      });
      router.push('/dashboard');
      setLoading(false);
      return;
    } catch (apiErr: any) {
      // 2. Fallback check for testing demo users if backend API is not running or returns error during testing
      const lowerUsername = formInput.username.toLowerCase().trim();

      // Buyer login test fallback
      if ((lowerUsername === 'buyer2' || lowerUsername === 'buyer2@example.com') && formInput.password === 'password123') {
        const buyerUser = {
          _id: 'buyer_2',
          username: 'buyer2',
          email: 'buyer2@example.com',
          isSeller: false,
          img: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
        };
        localStorage.setItem('user', JSON.stringify(buyerUser));
        setUser(buyerUser);
        toast.success("Welcome back, buyer2!", {
          duration: 3000,
          icon: "😃"
        });
        router.push('/dashboard');
        setLoading(false);
        return;
      }

      // Seller login test fallback (Anna Bell)
      if ((lowerUsername === 'anna bell' || lowerUsername === 'annabell' || lowerUsername === 'annabell@example.com') && formInput.password === 'password123') {
        const sellerUser = {
          _id: 'seller_anna',
          username: 'Anna Bell',
          email: 'annabell@example.com',
          isSeller: true,
          img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
        };
        localStorage.setItem('user', JSON.stringify(sellerUser));
        setUser(sellerUser);
        toast.success("Welcome back, Anna Bell!", {
          duration: 3000,
          icon: "😃"
        });
        router.push('/dashboard');
        setLoading(false);
        return;
      }

      // Default test user fallback
      if (lowerUsername === 'test@example.com' && formInput.password === 'Password123') {
        const fakeUser = {
          _id: 'test_123',
          username: 'Test User',
          email: 'test@example.com',
          isSeller: false,
          img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        };
        localStorage.setItem('user', JSON.stringify(fakeUser));
        setUser(fakeUser);
        toast.success("Welcome back! (Test Mode)", {
          duration: 3000,
          icon: "😃"
        });
        router.push('/dashboard');
        setLoading(false);
        return;
      }

      // If neither API nor test fallback succeeded
      const message = apiErr.response?.data?.message || 'Invalid username or password';
      setError(message);
      toast.error(message, {
        duration: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="left-pane">
          <div className="email-form">
            <div className="logo-container-step2">
              <img src="/Workvence-logo-Horizontal 1.png" alt="Workvence" className="brand-logo" />
            </div>
            
            <button className="back-btn" onClick={() => router.back()}>← Back</button>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-fields">
                <h1>Continue with username</h1>
                
                <div className="demo-accounts-bar">
                  <span className="demo-title">Quick Fill Demo Credentials:</span>
                  <div className="demo-btns">
                    <button 
                      type="button" 
                      className={`demo-btn ${formInput.username === 'buyer2' ? 'active' : ''}`}
                      onClick={() => setFormInput({ username: 'buyer2', password: 'password123' })}
                    >
                      👤 Buyer (buyer2)
                    </button>
                    <button 
                      type="button" 
                      className={`demo-btn ${formInput.username === 'Anna Bell' ? 'active' : ''}`}
                      onClick={() => setFormInput({ username: 'Anna Bell', password: 'password123' })}
                    >
                      ⭐ Seller (Anna Bell)
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>User name</label>
                  <input name="username" type="text" placeholder="Enter your user name" value={formInput.username} onChange={handleFormInput} />
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

export default Login;
