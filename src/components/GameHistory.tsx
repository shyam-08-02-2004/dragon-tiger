import React, { useMemo, useState, useEffect } from 'react';
import { getDeterministicCards } from '../syncEngine';
import { determineResult } from '../types/game';
import type { GameResult } from '../types/game';
import './GameHistory.css';

interface GameHistoryProps {
  currentRound: number;
  rawRoundId: number;
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

interface PastRound {
  round: number;
  rawRoundId: number;
  winner: GameResult;
}

const winnerInfo = (winner: GameResult) => {
  if (winner === 'dragon') return { label: 'Dragon', icon: '🐉', cls: 'gh-win-dragon', glow: 'glow-red' };
  if (winner === 'tiger') return { label: 'Tiger', icon: '🐯', cls: 'gh-win-tiger', glow: 'glow-blue' };
  return { label: 'Tie', icon: '🤝', cls: 'gh-win-tie', glow: 'glow-green' };
};

const GameHistory: React.FC<GameHistoryProps> = ({ currentRound, rawRoundId, isOpen, onClose, username }) => {
  const [serverHistory, setServerHistory] = useState<any[]>([]);
  const [adminOutcomes, setAdminOutcomes] = useState<{ roundId: number; outcome: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'game' | 'bets'>('game');
  const [betHistory, setBetHistory] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [winLossFilter, setWinLossFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (isOpen) {
      if (!username) {
        setActiveTab('game');
      } else {
        const stored = sessionStorage.getItem('dt_historyTab') as 'game' | 'bets';
        if (stored) setActiveTab(stored);
      }
    }
  }, [isOpen, username]);

  const handleTabChange = (tab: 'game' | 'bets') => {
    setActiveTab(tab);
    sessionStorage.setItem('dt_historyTab', tab);
    setSearchQuery('');
    setWinLossFilter('all');
    setVisibleCount(20);
  };

  const fetchAllData = async () => {
    try {
      const p1 = fetch(`/api/history?t=${Date.now()}`).then(res => res.json());
      const p2 = fetch(`/api/admin/round-outcomes?t=${Date.now()}`).then(res => res.json());
      const res = await Promise.all([p1, p2]);
      if (Array.isArray(res[0])) setServerHistory(res[0]);
      if (Array.isArray(res[1])) setAdminOutcomes(res[1]);

      if (username) {
        const b = await fetch(`/api/users/bet-history/${username}?t=${Date.now()}`).then(r => r.json());
        if (Array.isArray(b)) setBetHistory(b);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen, username]);

  const pastRounds = useMemo(() => {
    const rounds: PastRound[] = [];
    const maxHistory = 200;
    const firstVisibleRawId = Math.max(rawRoundId - maxHistory, 0);

    const serverMap = new Map<number, string>();
    for (const h of serverHistory) serverMap.set(Number(h.roundId), h.result);
    
    const adminMap = new Map<number, string>();
    for (const a of adminOutcomes) adminMap.set(Number(a.roundId), a.outcome);
    
    for (let pastRawId = rawRoundId - 1; pastRawId >= firstVisibleRawId; pastRawId--) {
      if (pastRawId < 0) break;
      const pastRoundId = (pastRawId % 2000) + 1;
      
      const serverResult = serverMap.get(pastRawId);
      if (serverResult) {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: serverResult as GameResult });
        continue;
      }
      const adminOutcome = adminMap.get(pastRoundId);
      if (adminOutcome && adminOutcome !== 'none') {
        rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: adminOutcome as GameResult });
        continue;
      }
      const { dragonCard, tigerCard } = getDeterministicCards(pastRoundId, pastRawId);
      rounds.push({ round: pastRoundId, rawRoundId: pastRawId, winner: determineResult(dragonCard, tigerCard) });
    }
    return rounds;
  }, [currentRound, rawRoundId, serverHistory, adminOutcomes]);

  // Apply filters
  const filteredRounds = pastRounds.filter(r => {
    if (searchQuery && !String(r.round).includes(searchQuery)) return false;
    return true;
  });

  const filteredBets = betHistory.filter(b => {
    if (searchQuery && !String(b.roundNumber).includes(searchQuery)) return false;
    const isWin = b.winAmount > 0;
    if (winLossFilter === 'win' && !isWin) return false;
    if (winLossFilter === 'loss' && isWin) return false;
    return true;
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setVisibleCount(prev => prev + 20);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  if (!isOpen) return null;

  return (
    <div className="gh-premium-overlay" onClick={onClose}>
      <div className="gh-premium-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="gh-premium-header">
          <div className="gh-header-title">
            <h2>{activeTab === 'game' ? '📊 Game History' : '🎯 My Bets'}</h2>
          </div>
          <div className="gh-header-actions">
            <button className="gh-action-btn" onClick={handleRefresh}>🔄 Refresh</button>
            <button className="gh-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        {username && (
          <div className="gh-premium-tabs">
            <button 
              className={`gh-tab ${activeTab === 'game' ? 'active' : ''}`}
              onClick={() => handleTabChange('game')}
            >
              Game History
            </button>
            <button 
              className={`gh-tab ${activeTab === 'bets' ? 'active' : ''}`}
              onClick={() => handleTabChange('bets')}
            >
              My Bets
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="gh-premium-filters">
          <input 
            type="text" 
            placeholder="🔍 Search Round #" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gh-search-input"
          />
          
          {activeTab === 'bets' && (
            <select 
              value={winLossFilter} 
              onChange={(e) => setWinLossFilter(e.target.value as 'all' | 'win' | 'loss')}
              className="gh-filter-select"
            >
              <option value="all">All Outcomes</option>
              <option value="win">🟢 Won</option>
              <option value="loss">🔴 Lost</option>
            </select>
          )}
        </div>

        {/* List Content */}
        <div className="gh-premium-content" onScroll={handleScroll}>
          {activeTab === 'game' ? (
            <div className="gh-cards-grid">
              {filteredRounds.length === 0 ? (
                <div className="gh-empty">No history found</div>
              ) : (
                filteredRounds.slice(0, visibleCount).map((r, i) => {
                  const { label, icon, glow } = winnerInfo(r.winner);
                  const roundTime = new Date(r.rawRoundId * 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                  return (
                    <div key={`${r.round}-${r.rawRoundId}`} className={`gh-history-card ${glow}`}>
                      <div className="gh-card-top">
                        <span className="gh-round-num">Round #{String(r.round).padStart(3, '0')}</span>
                        <span className="gh-time">{roundTime}</span>
                      </div>
                      <div className="gh-card-bottom">
                        <div className="gh-winner-badge">
                          <span className="icon">{icon}</span>
                          <span className="text">{label} Win</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="gh-cards-grid">
              {filteredBets.length === 0 ? (
                <div className="gh-empty">No bets found</div>
              ) : (
                filteredBets.slice(0, visibleCount).map((b) => {
                  const isWin = b.winAmount > 0;
                  const isPending = b.winAmount === 0 && b.betAmount > 0; // if status is somehow pending
                  const statusLabel = isWin ? '🟢 Won' : isPending ? '🟡 Pending' : '🔴 Lost';
                  const glowClass = isWin ? 'glow-green' : isPending ? 'glow-gold' : 'glow-red';
                  
                  return (
                    <div key={b._id || Math.random()} className={`gh-bet-card ${glowClass}`}>
                      <div className="gh-card-header">
                        <span className="gh-round-num">Round #{b.roundNumber}</span>
                        <span className="gh-time">
                          {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                      <div className="gh-card-body">
                        <div className="gh-bet-detail">
                          <span className="lbl">Bet Side</span>
                          <span className="val">{b.betSide === 'dragon' ? '🐉 Dragon' : b.betSide === 'tiger' ? '🐅 Tiger' : '🟢 Tie'}</span>
                        </div>
                        <div className="gh-bet-detail">
                          <span className="lbl">Bet Amount</span>
                          <span className="val">₹{b.betAmount}</span>
                        </div>
                        <div className="gh-bet-detail">
                          <span className="lbl">Result</span>
                          <span className={`val ${isWin ? 'text-green' : 'text-red'}`}>
                            {isWin ? `+₹${b.winAmount}` : `-₹${b.betAmount}`}
                          </span>
                        </div>
                      </div>
                      <div className="gh-card-footer">
                        <span className={`gh-status-badge ${isWin ? 'bg-green' : 'bg-red'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {visibleCount < filteredBets.length && (
                <div className="gh-loading-more">Scroll for more...</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GameHistory;
