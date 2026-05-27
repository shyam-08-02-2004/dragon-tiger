import React, { useState } from 'react';
import './Auth.css';

export interface UserAccount {
  username: string;
  balance: number;
  hasDeposited?: boolean;
  id?: string;
  password?: string;
}

interface AuthProps {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Step Management for Signup & Forgot Password
  // 1: Initiation (Details / Mobile)
  // 2: OTP
  // 3: Password creation / reset
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [loginId, setLoginId] = useState(''); // Mobile or Admin User/Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [otpInput, setOtpInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  
  const [showOtpToast, setShowOtpToast] = useState(false);

  // -------------------------
  // LOGIN LOGIC
  // -------------------------
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim();
    const pwd = password;

    if (id !== 'babu' && !/^\d{10}$/.test(id)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: pwd })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      onLogin(data);
    } catch (err) {
      setError('Server error during login.');
    }
  };


  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !mobileNumber.trim()) {
      setError('Please enter Username and Mobile Number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const usersStr = localStorage.getItem('dragonTigerUsers') || '{}';
    const users = JSON.parse(usersStr);
    const mNum = mobileNumber.trim();

    if (users[mNum]) {
      setError('This mobile number is already registered.');
      return;
    }

    // Simulate OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setStep(2);
    
    // Show animated toast instead of alert
    setShowOtpToast(true);
    setTimeout(() => setShowOtpToast(false), 5000);
  };

  const handleSignupStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput === generatedOtp) {
      setStep(3);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  
  const handleSignupStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const mNum = mobileNumber.trim();
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mNum, username: username.trim(), password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      onLogin(data);
    } catch (err) {
      setError('Server error during signup.');
    }
  };


  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber.trim()) {
      setError('Please enter your registered Mobile Number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const usersStr = localStorage.getItem('dragonTigerUsers') || '{}';
    const users = JSON.parse(usersStr);

    if (!users[mobileNumber.trim()]) {
      setError('Account not found with this Mobile Number.');
      return;
    }

    // Simulate OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setStep(2);
    
    // Show animated toast instead of alert
    setShowOtpToast(true);
    setTimeout(() => setShowOtpToast(false), 5000);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput === generatedOtp) {
      setStep(3);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  
  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const mNum = mobileNumber.trim();

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mNum, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Password reset failed');
        return;
      }
      onLogin(data);
    } catch (err) {
      setError('Server error during reset.');
    }
  };


  
  const resetForm = () => {
    setLoginId('');
    setPassword('');
    setUsername('');
    setMobileNumber('');
    setConfirmPassword('');
    setOtpInput('');
    setError('');
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setIsTransitioning(true);
    setTimeout(() => {
      resetForm();
      setMode(newMode);
      setStep(1);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const changeStep = (newStep: 1 | 2 | 3) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setError('');
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const getFormSubmitHandler = () => {
    if (mode === 'login') return handleLoginSubmit;
    if (mode === 'signup') {
      if (step === 1) return handleSignupStep1;
      if (step === 2) return handleSignupStep2;
      return handleSignupStep3;
    }
    if (mode === 'forgot') {
      if (step === 1) return handleForgotStep1;
      if (step === 2) return handleForgotStep2;
      return handleForgotStep3;
    }
  };

  const getButtonText = () => {
    if (mode === 'login') return 'LOGIN';
    if (step === 1) return 'SEND OTP';
    if (step === 2) return 'VERIFY OTP';
    if (mode === 'forgot' && step === 3) return 'RESET PASSWORD';
    return 'CREATE ACCOUNT';
  };

  const getTitleText = () => {
    if (mode === 'login') return 'VIP ACCESS';
    if (mode === 'signup') {
      if (step === 1) return 'JOIN THE ACTION';
      if (step === 2) return 'VERIFY MOBILE';
      if (step === 3) return 'SECURE ACCOUNT';
    }
    if (mode === 'forgot') {
      if (step === 1) return 'RESET PASSWORD';
      if (step === 2) return 'VERIFY MOBILE';
      if (step === 3) return 'NEW PASSWORD';
    }
    return '';
  };

  return (
    <div className="auth-container">
      {/* Animated OTP Toast */}
      {showOtpToast && (
        <div className="otp-toast">
          <div className="otp-toast-header">
            <span className="otp-toast-icon">💬</span>
            <span>Secure Message</span>
          </div>
          <div className="otp-toast-body">
            Your VIP verification code is <strong>{generatedOtp}</strong>
          </div>
        </div>
      )}

      <div className={`auth-card ${isTransitioning ? 'mode-transition' : ''}`}>
        <div className="auth-header">
          <div className="logo-group">
            <span className="logo-dragon">🐉</span>
            <div className="logo-text">
              <span className="logo-main">Dragon</span>
              <span className="logo-separator">vs</span>
              <span className="logo-tiger">Tiger</span>
            </div>
            <span className="logo-tiger-icon">🐯</span>
          </div>
          <h2 className="auth-title">
            {getTitleText()}
          </h2>
        </div>

        <form className="auth-form" onSubmit={getFormSubmitHandler()}>
          {error && <div className="auth-error">{error}</div>}
          
          {/* ---------------- LOGIN MODE ---------------- */}
          {mode === 'login' && (
            <>
              <div className="input-group">
                <label htmlFor="loginId">Registered Mobile Number</label>
                <input
                  type="text"
                  id="loginId"
                  maxLength={10}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter Mobile Number"
                  autoComplete="off"
                />
              </div>

              
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                  <button 
                    type="button" 
                    className="toggle-btn" 
                    style={{ fontSize: '12px', textDecoration: 'none' }}
                    onClick={() => changeMode('forgot')}
                  >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {/* ---------------- SIGNUP / FORGOT (STEP 1) ---------------- */}
          {mode !== 'login' && step === 1 && (
            <>
              {mode === 'signup' && (
                <div className="input-group">
                  <label htmlFor="username">Choose Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="input-group">
                <label htmlFor="mobileNumber">Mobile Number (For OTP)</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  autoComplete="off"
                />
              </div>
            </>
          )}

          {/* ---------------- SIGNUP / FORGOT (STEP 2: OTP) ---------------- */}
          {mode !== 'login' && step === 2 && (
            <div className="input-group">
              <label htmlFor="otp">Enter 6-digit OTP sent to {mobileNumber}</label>
              <input
                type="text"
                id="otp"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="e.g. 123456"
                maxLength={6}
                autoComplete="off"
              />
            </div>
          )}

          {/* ---------------- SIGNUP / FORGOT (STEP 3: PASSWORD) ---------------- */}
          {mode !== 'login' && step === 3 && (
            <>
              
              <div className="input-group">
                <label htmlFor="password">Create New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ccc' }}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                />
              </div>
            </>
          )}

          <button type="submit" className="main-action-btn auth-submit-btn">
            <span className="btn-shine" />
            <span className="deal-btn-text">
              {getButtonText()}
            </span>
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : "Already registered? "}
          <button 
            type="button" 
            className="toggle-btn"
            onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up here' : 'Login here'}
          </button>
        </div>

        {mode !== 'login' && step > 1 && (
          <div className="auth-toggle" style={{ marginTop: '15px' }}>
            <button 
              type="button" 
              className="toggle-btn"
              onClick={() => changeStep((step - 1) as 1 | 2)}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
