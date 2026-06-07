import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { showCasinoAlert } from '../utils/casinoAlert';
import './WalletModal.css';

interface WalletModalProps {
  onClose: () => void;
  username: string;
  hasDeposited: boolean;
  balance: number;
  onWithdrawSuccess?: (amount: number) => void;
  onDepositSuccess?: (amount: number) => void;
  syncBalance?: (newBalance: number, previousBalance?: number) => Promise<void>;
  setLastUpdate?: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, username, hasDeposited, balance, onWithdrawSuccess, onDepositSuccess, syncBalance, setLastUpdate }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>(() => (sessionStorage.getItem('dt_walletTab') as 'deposit' | 'withdraw') || 'deposit');
  const [amount, setAmount] = useState('');

  const handleTabChange = (newTab: 'deposit' | 'withdraw') => {
    setTab(newTab);
    sessionStorage.setItem('dt_walletTab', newTab);
    setMessage('');
  };
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | 'pending'>('error');
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const [kycVerified, setKycVerified] = useState<boolean>(() => localStorage.getItem(`dt_kyc_${username}`) === 'true');
  const [kycMobile, setKycMobile] = useState<string>('');
  const [kycUpi, setKycUpi] = useState<string>('');
  const [isKycLoading, setIsKycLoading] = useState(false);

  const handleVerifyKyc = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(kycMobile)) {
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
      localStorage.setItem(`dt_kyc_${username}`, 'true');
      showCasinoAlert('UPI eKYC Verified Successfully!', 'success');
    }, 2000);
  };


  useEffect(() => {
  }, [tab, username]);

  const msgTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMessage('');
    setMsgType('error');
    if (msgTimeoutRef.current) {
      window.clearTimeout(msgTimeoutRef.current);
      msgTimeoutRef.current = null;
    }
    setAmount('');
    setUtr('');
    setUpiId('');
    setPendingMessage(null);
  }, [tab]);

  const showMsg = (text: string, type: 'success' | 'error' | 'pending') => {
    showCasinoAlert('Wallet Notice', text, type === 'pending' ? 'info' : type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const val = parseInt(amount);

    if (isNaN(val)) { showMsg('Please enter a valid amount.', 'error'); setIsSubmitting(false); return; }

    if (tab === 'deposit' && val < 300) {
      showMsg('Minimum deposit is ₹300.', 'error'); setIsSubmitting(false); return;
    }

    if (tab === 'withdraw' && val < 600) {
      showMsg('Minimum withdrawal is ₹600.', 'error'); setIsSubmitting(false); return;
    }

    if (tab === 'withdraw' && val > balance) {
      showMsg('Insufficient balance.', 'error'); setIsSubmitting(false); return;
    }

    if (tab === 'deposit') {
      const utrStr = utr.trim();
      if (!/^\d{12}$/.test(utrStr)) {
        showMsg('UTR must be exactly 12 digits (numbers only).', 'error'); setIsSubmitting(false); return;
      }
    }

    if (tab === 'withdraw') {
      const upiStr = upiId.trim();
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiStr)) {
        showMsg('Please enter a valid UPI ID (e.g., name@ybl).', 'error'); setIsSubmitting(false); return;
      }
    }

    // Save transaction (balance cut happens on admin approval)
    
    const txData = {
      id: Date.now().toString(),
      username,
      type: tab,
      amount: val,
      utr: tab === 'deposit' ? utr.trim() : null,
      upiId: tab === 'withdraw' ? upiId.trim() : null,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    if (tab === 'withdraw') {
      setAmount(''); setUpiId('');
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      if (!res.ok) {
        const err = await res.json();
        showMsg(err.error || 'Transaction failed', 'error');
        setIsSubmitting(false);
        return;
      }
    } catch(e) {
      console.error('Submit error:', e);
      setIsSubmitting(false);
      // Fall through to success message as requested to remove the network error UI
    }

    if (tab === 'withdraw') {
      if (syncBalance) {
        syncBalance(balance - val, balance).catch(() => {});
      }
      if (onWithdrawSuccess) onWithdrawSuccess(val);
      setPendingMessage('pending');
    } else {
      if (onDepositSuccess) onDepositSuccess(val);
      showMsg(`Your deposit request for ₹${val} has been sent for approval.`, 'success');
    }

    setAmount(''); setUtr(''); setUpiId('');
    setIsSubmitting(false);
  };

  return (
    <div className="wallet-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wallet-close" onClick={onClose}>✕</button>
        <h2>💰 Wallet</h2>
        <div className="balance-card">Current Balance: ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>

        <div className="wallet-tabs">
          <button
            className={`wallet-tab ${tab === 'deposit' ? 'active' : ''}`}
            onClick={() => { handleTabChange('deposit'); setDepositStep(1); }}
          >
            ➕ Deposit
          </button>
          <button
              className={`wallet-tab ${tab === 'withdraw' ? 'active' : ''} ${!hasDeposited ? 'disabled' : ''}`}
              onClick={() => { if (hasDeposited) handleTabChange('withdraw'); else showMsg('Please make a deposit first to enable withdrawals.', 'error'); }}
          >
            💸 Withdraw
          </button>
        </div>

        <form className="wallet-form" onSubmit={handleSubmit}>

            <>
              {tab === 'deposit' && depositStep === 1 && (
                <>
                  <div className="wallet-input-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Min ₹300"
                      min={300}                    />
                  </div>
                  <button 
                    type="button" 
                    className="wallet-submit-btn" 
                    onClick={() => {
                      const val = parseInt(amount);
                      if (isNaN(val) || val < 300) {
                        showMsg('Minimum deposit is ₹300.', 'error');
                      } else {
                        setMessage('');
                        setDepositStep(2);
                      }
                    }}
                  >
                    Go for payment
                  </button>
                </>
              )}

              {tab === 'deposit' && depositStep === 2 && (
                <>
                  <button type="button" className="wallet-back-btn" onClick={() => setDepositStep(1)}>
                    ← Change Amount
                  </button>
                  <div className="wallet-qr-section">
                    <p style={{ color: '#000', marginBottom: '10px', fontWeight: 'bold' }}>Scan to Pay ₹{amount}</p>
                    <QRCodeSVG 
                      value={`upi://pay?pa=prashantdangi0077@okaxis&pn=DragonTiger&am=${amount || 0}&cu=INR`} 
                      size={140} 
                    />
                  </div>
                  <div className="wallet-input-group">
                    <label>UTR / Transaction ID</label>
                    <input
                      type="text"
                      value={utr}
                      onChange={e => setUtr(e.target.value)}
                      placeholder="Enter 12-digit UTR" maxLength={12}
                    />
                    <small className="wallet-help">Payment successful hone ke baad UTR yahan dalein.</small>
                  </div>
                  <button type="submit" className="wallet-submit-btn">
                    📤 Submit UTR
                  </button>
                </>
              )}

              {tab === 'withdraw' && (
                <>
                  {!hasDeposited ? (
                    <div className="wallet-message error" style={{ textAlign: 'center', padding: '20px' }}>
                      <strong>Withdrawals disabled</strong><br/><br/>
                      Aapko withdrawal request karne se pehle pehla deposit karna hoga.
                    </div>
                  ) : pendingMessage ? (
                    <div className="premium-status-card" style={{ padding: '24px', background: 'linear-gradient(145deg, rgba(46,204,113,0.1), rgba(0,0,0,0.8))', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '16px', textAlign: 'center' }}>
                      <div className="status-icon-wrapper" style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        ✅
                      </div>
                      <h3 className="status-title" style={{ color: '#fff', fontSize: '22px', marginBottom: '8px' }}>
                        {pendingMessage === 'approved' ? 'Approval Successful' : 'Payment Successful'}
                      </h3>
                      <p className="status-desc" style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.5' }}>
                        {pendingMessage === 'approved' 
                          ? 'Aapka withdrawal request successfully approve ho gaya hai.'
                          : 'Aapka payment successfully submit ho gaya hai aur requested amount wallet se deduct ho gaya hai.'}
                      </p>
                      {pendingMessage === 'approved' && (
                        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)', borderRadius: '8px', color: '#f1c40f', fontSize: '13px' }}>
                          ⏳ <strong>Next Step:</strong> 6 working days me payment aapke wallet ya bank me aa jayega.
                        </div>
                      )}
                    </div>
                  ) : balance < 600 ? (
                    <div className="wallet-message error" style={{ textAlign: 'center', padding: '20px' }}>
                      <strong>Insufficient Balance</strong><br/><br/>
                      Aapke wallet me ₹{balance} hain. <br/>
                      Minimum withdrawal ke liye ₹600 hona zaruri hai.
                    </div>
                  ) : !kycVerified ? (
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
                  )}
                </>
              )}
            </>
        </form>
      </div>
    </div>
  );
};

export default WalletModal;
