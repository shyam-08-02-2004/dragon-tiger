const fs = require('fs');

const css = `
/* ==========================================================================
   eKYC PREMIUM CSS
   ========================================================================== */

.kyc-verification-card {
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.9), rgba(10, 10, 15, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-top: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(212, 175, 55, 0.05);
  animation: hcPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.kyc-header {
  text-align: center;
  margin-bottom: 20px;
}

.kyc-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
  text-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.kyc-header h3 {
  color: #f1c40f;
  margin: 0 0 5px 0;
  font-size: 20px;
  letter-spacing: 1px;
}

.kyc-header p {
  color: #aaa;
  font-size: 13px;
  margin: 0;
}

.kyc-verify-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.kyc-verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(46, 204, 113, 0.6);
}

.kyc-verify-btn:disabled {
  background: #555;
  cursor: not-allowed;
  box-shadow: none;
}

.kyc-loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.kyc-success-badge {
  background: rgba(46, 204, 113, 0.15);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 10px 15px;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.2);
  animation: hcPop 0.3s ease;
}

.withdrawal-form-container {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

fs.appendFileSync('C:/dragonTiger/src/components/WalletModal.css', css);
console.log('WalletModal.css updated');
