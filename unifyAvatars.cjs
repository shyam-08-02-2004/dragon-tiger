const fs = require('fs');

// 1. Add global CSS to index.css
const cssToAdd = `
/* ==========================================================================
   UNIFIED VIP CASINO AVATAR
   ========================================================================== */
.vip-unified-wrapper {
  position: relative;
  display: inline-block;
}

.vip-unified-ring {
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #FFD700, #8B6508, #FFD700, #FDF5A9);
  background-size: 300% 300%;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  animation: unifiedGlowRotate 4s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes unifiedGlowRotate {
  0% { background-position: 0% 50%; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
  50% { background-position: 100% 50%; box-shadow: 0 0 30px rgba(255, 215, 0, 0.7); }
  100% { background-position: 0% 50%; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
}

.vip-unified-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #0A0A0A;
}

/* Specific Sizes */
.vip-unified-wrapper.size-lg .vip-unified-ring {
  width: 90px;
  height: 90px;
}
.vip-unified-wrapper.size-md .vip-unified-ring {
  width: 50px;
  height: 50px;
}
.vip-unified-wrapper.size-sm .vip-unified-ring {
  width: 36px;
  height: 36px;
}
`;

fs.appendFileSync('C:/dragonTiger/src/index.css', cssToAdd);

// 2. Update ProfileModal.tsx
let profileCode = fs.readFileSync('C:/dragonTiger/src/components/ProfileModal.tsx', 'utf8');
profileCode = profileCode.replace(/className="up-avatar-wrapper"/g, 'className="vip-unified-wrapper size-lg"');
profileCode = profileCode.replace(/className="up-avatar-ring"/g, 'className="vip-unified-ring"');
profileCode = profileCode.replace(/className="up-avatar-img"/g, 'className="vip-unified-img"');
fs.writeFileSync('C:/dragonTiger/src/components/ProfileModal.tsx', profileCode);

// 3. Update Header.tsx
let headerCode = fs.readFileSync('C:/dragonTiger/src/components/Header.tsx', 'utf8');
const headerOldAvatar = `<div className="ph-avatar-wrapper">
          <img src={vipAvatar} alt="Profile" className="ph-avatar" />
        </div>`;
const headerNewAvatar = `<div className="vip-unified-wrapper size-md">
          <div className="vip-unified-ring">
            <img src={vipAvatar} alt="Profile" className="vip-unified-img" />
          </div>
        </div>`;
if (headerCode.includes('<div className="ph-avatar-wrapper">')) {
  headerCode = headerCode.replace(headerOldAvatar, headerNewAvatar);
  fs.writeFileSync('C:/dragonTiger/src/components/Header.tsx', headerCode);
}

// 4. Update Sidebar.tsx
let sidebarCode = fs.readFileSync('C:/dragonTiger/src/components/Sidebar.tsx', 'utf8');
const sidebarOldAvatar = `<div className="avatar">
            {/* Placeholder avatar, could be replaced with user.avatarUrl */}
            <img src={user?.avatarUrl || vipAvatar} alt="avatar" />
          </div>`;
const sidebarNewAvatar = `<div className="vip-unified-wrapper size-md">
            <div className="vip-unified-ring">
              <img src={user?.avatarUrl || vipAvatar} alt="avatar" className="vip-unified-img" />
            </div>
          </div>`;
if (sidebarCode.includes('<div className="avatar">')) {
  sidebarCode = sidebarCode.replace(sidebarOldAvatar, sidebarNewAvatar);
  fs.writeFileSync('C:/dragonTiger/src/components/Sidebar.tsx', sidebarCode);
}

console.log('Avatars unified!');
