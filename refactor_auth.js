import fs from 'fs';

let content = fs.readFileSync('src/components/Auth.tsx', 'utf8');

// Replace handleLoginSubmit logic
const loginLogic = `
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim();
    const pwd = password;

    if (id !== 'babu' && !/^\\d{10}$/.test(id)) {
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
`;

content = content.replace(/const handleLoginSubmit = \([\s\S]*?const handleSignupStep1/m, loginLogic + '\n\n  const handleSignupStep1');

// Replace handleSignupStep3 logic
const signupLogic = `
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
`;
content = content.replace(/const handleSignupStep3 = \([\s\S]*?const handleForgotStep1/m, signupLogic + '\n\n  const handleForgotStep1');

// Replace handleForgotStep3 logic
const resetLogic = `
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
`;
content = content.replace(/const handleForgotStep3 = \([\s\S]*?const getButtonText/m, resetLogic + '\n\n  const getButtonText');

fs.writeFileSync('src/components/Auth.tsx', content);
console.log("Refactored Auth.tsx for API integration.");
