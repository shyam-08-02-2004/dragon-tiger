import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Mobile Number
  username: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 50 },
  hasDeposited: { type: Boolean, default: false }
});

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true }, // Should technically be userId, but keeping username for frontend compatibility
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  utr: { type: String, validate: { validator: function(v) { return !v || v.length === 12; }, message: 'UTR must be exactly 12 digits.' } },
  upiId: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const adminSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: 'global' },
  forcedOutcomes: { type: [String], default: [] },
  lastConsumedRound: { type: Number, default: 0 },
  currentRoundOutcome: {
    roundId: { type: Number },
    outcome: { type: String }
  },
  roundOutcomes: [{
    roundId: { type: Number },
    outcome: { type: String }
  }]
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema);

// Tracks live bets per round for admin dashboard
const roundBetSchema = new mongoose.Schema({
  roundId: { type: Number, required: true },
  username: { type: String, required: true },
  betType: { type: String, required: true }, // 'dragon', 'tiger', 'tie'
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const RoundBet = mongoose.models.RoundBet || mongoose.model('RoundBet', roundBetSchema);

// Notification schema for user alerts (e.g. transaction rejected)
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info' },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Tracks global history up to 2000 rounds
const roundHistorySchema = new mongoose.Schema({
  roundId: { type: Number, required: true, unique: true },
  roundNumber: { type: Number, required: true },
  result: { type: String, enum: ['dragon', 'tiger', 'tie'], required: true },
  timestamp: { type: Date, default: Date.now }
});
// Create a TTL index to automatically delete records older than a specific time if needed,
// but since we only need the latest 2000 per epoch, we can just fetch the epoch's data.
export const RoundHistory = mongoose.models.RoundHistory || mongoose.model('RoundHistory', roundHistorySchema);

// Help Center Chat Messages
const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // The user's mobile/id
  sender: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  readByAdmin: { type: Boolean, default: false },
  readByUser: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

// Daily User Bet History
const userBetHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  roundId: { type: Number, required: true },
  roundNumber: { type: Number, required: true },
  betSide: { type: String, default: '' },
  betAmount: { type: Number, required: true },
  winAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
export const UserBetHistory = mongoose.models.UserBetHistory || mongoose.model('UserBetHistory', userBetHistorySchema);

