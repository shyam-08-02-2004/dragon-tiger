import React, { useEffect, useState } from 'react';
import './WinPopup.css';

interface WinPopupProps {
  winAmount: number;
  onClose?: () => void;
}

const WinPopup: React.FC<WinPopupProps> = ({ winAmount, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (winAmount > 0) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 2500); // Hide after 2.5 seconds (gives time for animation)
      return () => clearTimeout(timer);
    }
  }, [winAmount, onClose]);

  if (!show || winAmount <= 0) return null;

  return (
    <div className="win-popup-overlay">
      <div className="win-popup-container">
        
        {/* Top Decorative Ribbon/Badge */}
        <div className="win-badge">
          <div className="win-badge-icon">🚀</div>
          <div className="win-ribbon left-ribbon"></div>
          <div className="win-ribbon right-ribbon"></div>
        </div>

        {/* Main Card */}
        <div className="win-card">
          <h2 className="win-title">Congratulations on your<br/>winning</h2>
          
          <div className="win-subtitle">lottery result</div>
          
          {/* Slot for receipt */}
          <div className="ticket-slot-container">
            <div className="ticket-slot"></div>
            
            {/* The animated receipt/ticket */}
            <div className="receipt-paper">
              <div className="receipt-content">
                <div className="receipt-amount">+₹{winAmount}</div>
                <div className="receipt-text">SUCCESS</div>
              </div>
              {/* Folded bottom edge illusion */}
              <div className="receipt-bottom"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WinPopup;
