const fs = require('fs');

let content = fs.readFileSync('C:/dragonTiger/src/components/WalletModal.tsx', 'utf8');

// 1. Inject states
if (!content.includes('const [kycVerified')) {
  const stateInjection = `
  const [kycVerified, setKycVerified] = useState<boolean>(() => localStorage.getItem(\`dt_kyc_\${username}\`) === 'true');
  const [kycMobile, setKycMobile] = useState<string>('');
  const [kycUpi, setKycUpi] = useState<string>('');
  const [isKycLoading, setIsKycLoading] = useState(false);

  const handleVerifyKyc = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\\d{9}$/.test(kycMobile)) {
      showCasinoAlert('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!kycUpi.includes('@')) {
      showCasinoAlert('Please enter a valid UPI ID (e.g. name@ybl).', 'error');
      return;
    }
    setIsKycLoading(true);
    setTimeout(() => {
      setIsKycLoading(false);
      setKycVerified(true);
      setUpiId(kycUpi);
      localStorage.setItem(\`dt_kyc_\${username}\`, 'true');
      showCasinoAlert('UPI eKYC Verified Successfully!', 'success');
    }, 2000);
  };
`;
  content = content.replace("const [pendingMessage, setPendingMessage] = useState<string | null>(null);", "const [pendingMessage, setPendingMessage] = useState<string | null>(null);\n" + stateInjection);
}

// 2. Inject JSX
const oldJsx = `) : (
                    <>
                      <div className="wallet-input-group">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="Min ₹600"
                          min={600}
                        />
                      </div>
                      <div className="wallet-input-group">
                        <label>Your UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="e.g. name@upi"
                        />
                        <small className="wallet-help">Aapka UPI ID jahan payment receive hogi.</small>
                      </div>
                      <button type="submit" className="wallet-submit-btn" disabled={isSubmitting || !amount || parseInt(amount) <= 0 || (tab === 'withdraw' && parseInt(amount) > balance)}>
                        {isSubmitting ? 'Processing...' : '📥 Request Withdrawal'}
                      </button>
                    </>
                  )}`;

const newJsx = `) : !kycVerified ? (
                    <div className="kyc-verification-card">
                      <div className="kyc-header">
                        <span className="kyc-icon">🛡️</span>
                        <h3>Premium eKYC Verification</h3>
                        <p>Withdrawal ke liye ek baar apna UPI ID verify karein.</p>
                      </div>
                      <div className="wallet-input-group">
                        <label>Registered Mobile Number</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={kycMobile}
                          onChange={e => setKycMobile(e.target.value)}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                      <div className="wallet-input-group">
                        <label>Your UPI ID</label>
                        <input
                          type="text"
                          value={kycUpi}
                          onChange={e => setKycUpi(e.target.value)}
                          placeholder="e.g. 9876543210@ybl"
                        />
                        <small className="wallet-help" style={{ color: '#aaa' }}>100% Secured via NPCI. Only for fast withdrawals.</small>
                      </div>
                      <button type="button" className="kyc-verify-btn" onClick={handleVerifyKyc} disabled={isKycLoading}>
                        {isKycLoading ? <span className="kyc-loader"></span> : '🔐 Verify & Continue'}
                      </button>
                    </div>
                  ) : (
                    <div className="withdrawal-form-container">
                      <div className="kyc-success-badge">
                        ✅ UPI eKYC Verified
                      </div>
                      <div className="wallet-input-group">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="Min ₹600"
                          min={600}
                        />
                      </div>
                      <div className="wallet-input-group">
                        <label>Your UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="e.g. name@upi"
                        />
                        <small className="wallet-help">Aapka UPI ID jahan payment receive hogi.</small>
                      </div>
                      <button type="submit" className="wallet-submit-btn" disabled={isSubmitting || !amount || parseInt(amount) <= 0 || (tab === 'withdraw' && parseInt(amount) > balance)}>
                        {isSubmitting ? 'Processing...' : '📥 Request Withdrawal'}
                      </button>
                    </div>
                  )}`;

if (content.includes('placeholder="Min ₹600"')) {
  content = content.replace(oldJsx, newJsx);
  fs.writeFileSync('C:/dragonTiger/src/components/WalletModal.tsx', content);
  console.log('WalletModal.tsx updated successfully');
} else {
  console.log('Could not find the target JSX to replace');
}
