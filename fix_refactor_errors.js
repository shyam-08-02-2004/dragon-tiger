import fs from 'fs';

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/{ suit: '(\S)', value: '([A-Z0-9]+)', numericValue: (\d+) }/g, "{ suit: '$1', rank: '$2', value: $3 }");
fs.writeFileSync('src/App.tsx', appContent);

// Fix AdminPanel.tsx
let adminContent = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminContent = adminContent.replace(/setUsers\(users\.filter\(u => u\.id !== id\)\);/, 'setUsers(users.filter((u: any) => u.id !== id));');
fs.writeFileSync('src/components/AdminPanel.tsx', adminContent);

// Fix Auth.tsx missing resetForm and getFormSubmitHandler
// I completely replaced the handleLoginSubmit logic and accidentally removed resetForm and getFormSubmitHandler.
// Let's restore them.
let authContent = fs.readFileSync('src/components/Auth.tsx', 'utf8');

const restoreMissing = `
  const resetForm = () => {
    setLoginId('');
    setPassword('');
    setUsername('');
    setMobileNumber('');
    setConfirmPassword('');
    setOtpInput('');
    setError('');
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
`;

authContent = authContent.replace(/const getButtonText = \(\) => \{/, restoreMissing + '\n  const getButtonText = () => {');
fs.writeFileSync('src/components/Auth.tsx', authContent);

console.log('Fixed typescript errors.');
