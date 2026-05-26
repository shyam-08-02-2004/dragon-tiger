import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './WalletModal.css';

interface WalletModalProps {
  onClose: () => void;
  username: string;
  hasDeposited: boolean;
  balance: number;
  onWithdrawSuccess?: (amount: number) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, username, hasDeposited, balance, onWithdrawSuccess }) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | 'pending'>('error');
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [rejectedMsg, setRejectedMsg] = useState('');

  useEffect(() => {
    if (tab === 'withdraw') {
      fetch('/api/transactions/' + username)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const lastWithdraw = data.find((t: any) => t.type === 'withdraw');
            if (lastWithdraw && lastWithdraw.status === 'rejected') {
              setRejectedMsg('Status Pending: Payment 5-6 din me wallet me aa jayega');
            } else {
              setRejectedMsg('');
            }
          }
        })
        .catch(console.error);
    } else {
      setRejectedMsg('');
    }
  }, [tab, username]);

  const showMsg = (text: string, type: 'success' | 'error' | 'pending') => {
    setMessage(text);
    setMsgType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);

    if (isNaN(val)) { showMsg('Please enter a valid amount.', 'error'); return; }

    if (tab === 'deposit' && val < 300) {
      showMsg('Minimum deposit is ₹300.', 'error'); return;
    }

    if (tab === 'withdraw' && !hasDeposited) {
      showMsg('Pehle real payment karein. Withdrawal tab unlock hoga.', 'error'); return;
    }

    if (tab === 'withdraw' && val < 600) {
      showMsg('Minimum withdrawal is ₹600.', 'error'); return;
    }

    if (tab === 'deposit') {
      const utrStr = utr.trim();
      if (!/^\d{12}$/.test(utrStr)) {
        showMsg('UTR must be exactly 12 digits (numbers only).', 'error'); return;
      }
    }

    if (tab === 'withdraw') {
      const upiStr = upiId.trim();
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiStr)) {
        showMsg('Please enter a valid UPI ID (e.g., name@ybl).', 'error'); return;
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
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      if (!res.ok) {
        const err = await res.json();
        showMsg(err.error || 'Transaction failed', 'error');
        return;
      }
    } catch(e) {
      console.error(e);
    }


    if (tab === 'withdraw') {
      showMsg('✅ Withdrawal Request Successful!', 'pending');
      if (onWithdrawSuccess) onWithdrawSuccess(val);
    } else {
      showMsg(`Your deposit request for ₹${val} has been sent for approval.`, 'success');
    }

    setAmount(''); setUtr(''); setUpiId('');
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="wallet-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>
        <button className="wallet-close" onClick={onClose}>✕</button>
        <h2>💰 Wallet</h2>

        <div className="wallet-tabs">
          <button
            className={`wallet-tab ${tab === 'deposit' ? 'active' : ''}`}
            onClick={() => { setTab('deposit'); setMessage(''); setDepositStep(1); }}
          >
            ➕ Deposit
          </button>
          <button
            className={`wallet-tab ${tab === 'withdraw' ? 'active' : ''}`}
            onClick={() => { setTab('withdraw'); setMessage(''); }}
          >
            💸 Withdraw
          </button>
        </div>

        {!hasDeposited && tab === 'withdraw' && (
          <div className="wallet-lock-notice">
            🔒 Withdrawal unlock karne ke liye pehle ek real deposit karein.
          </div>
        )}

        <form className="wallet-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`wallet-message ${msgType}`}>
              {message.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          )}

          {(!message || msgType !== 'pending') && (
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
                  <div className="wallet-qr-section" style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '12px', margin: '15px 0' }}>
                    <p style={{ color: '#000', marginBottom: '10px', fontWeight: 'bold' }}>Scan to Pay ₹{amount}</p>
                    <QRCodeSVG 
                      value={`upi://pay?pa=prashantdangi0077@okaxis&pn=DragonTiger&am=${amount || 0}&cu=INR`} 
                      size={180} 
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
                  {rejectedMsg && (
                    <div className="wallet-message warning" style={{ textAlign: 'center', padding: '15px', marginBottom: '15px', color: '#f39c12', border: '1px solid #f39c12', borderRadius: '8px', background: 'rgba(243, 156, 18, 0.1)' }}>
                      ⚠️ {rejectedMsg}
                    </div>
                  )}
                  {balance < 600 ? (
                    <div className="wallet-message error" style={{ textAlign: 'center', padding: '20px' }}>
                      Aapke wallet me ₹{balance} hain. <br/><br/>
                      Minimum withdrawal ke liye <b>₹600</b> hona zaruri hai.
                    </div>
                  ) : (
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
                      <button type="submit" className="wallet-submit-btn">
                        📥 Request Withdrawal
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {msgType === 'pending' && (
            <button type="button" className="wallet-close-btn" onClick={onClose}>
              Close
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default WalletModal;
