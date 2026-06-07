import React, { useEffect, useState } from 'react';
import './WinPopup.css';

interface WinPopupProps {
  winAmount: number;
  onClose?: () => void;
}

const WinPopup: React.FC<WinPopupProps> = ({ winAmount, onClose }) => {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let closeTimer: number;
    let removeTimer: number;

    if (winAmount > 0) {
      setShow(true);
      setIsClosing(false);
      
      closeTimer = window.setTimeout(() => {
        setIsClosing(true);
        removeTimer = window.setTimeout(() => {
          setShow(false);
          if (onClose) onClose();
        }, 500); // matches CSS animation duration
      }, 4000); // 4 seconds visible
    }
    
    return () => {
      if (closeTimer) clearTimeout(closeTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [winAmount, onClose]);

  if (!show || winAmount <= 0) return null;

  return (
    <div className={`win-popup-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="win-light-rays"></div>
      
      <div className={`win-vip-container ${isClosing ? 'closing' : ''}`}>
        
        <div className="win-vip-card">
          <div className="win-glow-sweep"></div>
          
          <div className="win-crown">👑</div>
          <h2 className="win-vip-title">BIG WIN</h2>
          <div className="win-vip-subtitle">CONGRATULATIONS</div>
          
          <div className="win-amount-box">
            <span className="win-currency">+₹</span>
            <span className="win-amount-value">{winAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="win-coins-container">
            <div className="win-coin coin-1">🪙</div>
            <div className="win-coin coin-2">🪙</div>
            <div className="win-coin coin-3">🪙</div>
            <div className="win-coin coin-4">🪙</div>
            <div className="win-coin coin-5">🪙</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WinPopup;
