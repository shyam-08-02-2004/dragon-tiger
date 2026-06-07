const fs = require('fs');
let content = fs.readFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', 'utf8');

if (!content.includes('const [fullScreenMedia, setFullScreenMedia]')) {
  // Insert state
  content = content.replace("const [activeTab, setActiveTab] = useState<'users' | 'game' | 'transactions' | 'support' | 'settings'>('users');", "const [activeTab, setActiveTab] = useState<'users' | 'game' | 'transactions' | 'support' | 'settings'>('users');\n  const [fullScreenMedia, setFullScreenMedia] = useState<{url: string, type: string} | null>(null);");

  // Update Image rendering in chat
  const oldImgCode = `<img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover' }} />`;
  const newImgCode = `<img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setFullScreenMedia({ url: msg.imageUrl, type: 'image' })} />`;
  content = content.replace(oldImgCode, newImgCode);

  // Update Video rendering
  const oldVidCode = `<video src={msg.imageUrl} controls style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '200px' }} />`;
  const newVidCode = `<video src={msg.imageUrl} controls style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '200px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }} />`;
  content = content.replace(oldVidCode, newVidCode);

  // Add lightbox before the final User History Modal
  const lightboxCode = `
      {fullScreenMedia && (
        <div className="media-lightbox-overlay" onClick={() => setFullScreenMedia(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <button style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer', textShadow: '0 0 10px rgba(0,0,0,0.5)' }} onClick={() => setFullScreenMedia(null)}>✕</button>
          {fullScreenMedia.type === 'image' ? (
            <img src={fullScreenMedia.url} alt="fullscreen attachment" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 10px 50px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()} />
          ) : (
            <video src={fullScreenMedia.url} controls autoPlay style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 10px 50px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
  `;
  content = content.replace("{/* User History Modal */}", lightboxCode + "\n      {/* User History Modal */}");
  
  fs.writeFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', content);
  console.log('AdminPanel updated for Media Viewer');
}
