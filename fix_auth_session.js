import fs from 'fs';

let authContent = fs.readFileSync('src/components/Auth.tsx', 'utf8');

// 1. Add showPassword state
authContent = authContent.replace(
    /const \[password, setPassword\] = useState\(''\);/,
    `const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);`
);

// 2. Wrap login password input
const loginPasswordHTML = `
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
              </div>`;

authContent = authContent.replace(
    /<div className="input-group">\s*<label htmlFor="password">Password<\/label>\s*<input\s*type="password"\s*id="password"\s*value=\{password\}\s*onChange=\{\(e\) => setPassword\(e\.target\.value\)\}\s*placeholder="Enter your password"\s*\/>\s*<\/div>/g,
    loginPasswordHTML
);

// 3. Wrap signup password input
const signupPasswordHTML = `
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
              </div>`;

authContent = authContent.replace(
    /<div className="input-group">\s*<label htmlFor="password">Create New Password<\/label>\s*<input\s*type="password"\s*id="password"\s*value=\{password\}\s*onChange=\{\(e\) => setPassword\(e\.target\.value\)\}\s*placeholder="Enter secure password"\s*\/>\s*<\/div>/g,
    signupPasswordHTML
);

fs.writeFileSync('src/components/Auth.tsx', authContent);

// 4. Change App.tsx localStorage to sessionStorage for currentUser ONLY
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
    /localStorage\.getItem\('dragonTigerCurrentUser'\)/g,
    `sessionStorage.getItem('dragonTigerCurrentUser')`
);

appContent = appContent.replace(
    /localStorage\.setItem\('dragonTigerCurrentUser'/g,
    `sessionStorage.setItem('dragonTigerCurrentUser'`
);

appContent = appContent.replace(
    /localStorage\.removeItem\('dragonTigerCurrentUser'\)/g,
    `sessionStorage.removeItem('dragonTigerCurrentUser')`
);

fs.writeFileSync('src/App.tsx', appContent);

console.log("Updated Auth.tsx and App.tsx for session handling and show password feature.");
