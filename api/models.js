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
