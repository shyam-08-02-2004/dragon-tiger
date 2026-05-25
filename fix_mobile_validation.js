import fs from 'fs';

let authContent = fs.readFileSync('src/components/Auth.tsx', 'utf8');

// 1. Validate loginId in handleLoginSubmit
authContent = authContent.replace(
    /const id = loginId\.trim\(\);\r?\n\s*const pwd = password;/,
    `const id = loginId.trim();\n    const pwd = password;\n\n    if (id !== 'babu' && !/^\\d{10}$/.test(id)) {\n      setError('Mobile number must be exactly 10 digits.');\n      return;\n    }`
);

// 2. Validate mobileNumber in handleSignupStep1
authContent = authContent.replace(
    /if \(\!username\.trim\(\) \|\| \!mobileNumber\.trim\(\)\) \{\r?\n\s*setError\('Please enter Username and Mobile Number\.'\);\r?\n\s*return;\r?\n\s*\}/,
    `if (!username.trim() || !mobileNumber.trim()) {\n      setError('Please enter Username and Mobile Number.');\n      return;\n    }\n\n    if (!/^\\d{10}$/.test(mobileNumber.trim())) {\n      setError('Mobile number must be exactly 10 digits.');\n      return;\n    }`
);

// 3. Validate mobileNumber in handleForgotStep1
authContent = authContent.replace(
    /if \(\!mobileNumber\.trim\(\)\) \{\r?\n\s*setError\('Please enter your registered Mobile Number\.'\);\r?\n\s*return;\r?\n\s*\}/,
    `if (!mobileNumber.trim()) {\n      setError('Please enter your registered Mobile Number.');\n      return;\n    }\n\n    if (!/^\\d{10}$/.test(mobileNumber.trim())) {\n      setError('Mobile number must be exactly 10 digits.');\n      return;\n    }`
);

// 4. Update the input element pattern/maxlength to give UX feedback
authContent = authContent.replace(
    /<input\r?\n\s*type="text"\r?\n\s*id="loginId"\r?\n\s*value=\{loginId\}/,
    `<input\n                  type="text"\n                  id="loginId"\n                  maxLength={10}\n                  value={loginId}`
);

authContent = authContent.replace(
    /<input\r?\n\s*type="tel"\r?\n\s*id="mobileNumber"\r?\n\s*value=\{mobileNumber\}/g,
    `<input\n                  type="tel"\n                  id="mobileNumber"\n                  maxLength={10}\n                  value={mobileNumber}`
);

fs.writeFileSync('src/components/Auth.tsx', authContent);

console.log("Updated Auth.tsx for 10 digit mobile validation.");
