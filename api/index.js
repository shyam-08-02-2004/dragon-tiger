import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { User, Transaction, AdminSettings, RoundBet, Notification, RoundHistory, ChatMessage } from './models.js';

const app = express();
app.use(cors());
app.use(express.json());

// Encode the password in the URI as requested
// Default to the provided link if .env is missing for some reason
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://shyambabudangi277_db_user:shyam%4075097@cluster1.h8jmgeq.mongodb.net/?appName=Cluster1';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const opts = { bufferCommands: false };
  cachedDb = await mongoose.connect(MONGO_URI, opts);
  return cachedDb;
}

// Ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection failed', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  const { id, password } = req.body;
  if (id === 'babu' && password === 'babu@9755') {
    return res.json({ username: 'babu', balance: 999999, hasDeposited: true, id: 'babu' });
  }
  
  const user = await User.findOne({ id });
  if (user && user.password === password) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { id, username, password } = req.body;
  const existingUser = await User.findOne({ id });
  if (existingUser) {
    return res.status(400).json({ error: 'Mobile number already registered.' });
  }
  
  const newUser = new User({ id, username, password, balance: 50, hasDeposited: false });
  await newUser.save();
  res.json(newUser);
});

app.post('/api/auth/reset', async (req, res) => {
  const { id, password } = req.body;
  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  
  user.password = password;
  await user.save();
  res.json(user);
});

app.get('/api/time', (req, res) => { res.json({ serverTime: Date.now() }); });

// USER ROUTES
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

app.put('/api/users/:id/balance', async (req, res) => {
  const { balance } = req.body;
  const user = await User.findOneAndUpdate({ id: req.params.id }, { balance }, { new: true });
  res.json(user);
});

// ADMIN ROUTES
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.delete('/api/admin/users/:id', async (req, res) => {
  await User.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
});

app.get('/api/admin/transactions', async (req, res) => {
  const transactions = await Transaction.find({}).sort({ timestamp: -1 });
  res.json(transactions);
});

app.get('/api/transactions/:username', async (req, res) => {
  const transactions = await Transaction.find({ username: req.params.username }).sort({ timestamp: -1 });
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  // Server-side validation
  if (req.body.type === 'deposit') {
    const utr = req.body.utr;
    if (!utr || !/^\d{12}$/.test(utr.trim())) {
      return res.status(400).json({ error: 'UTR must be exactly 12 digits (numbers only).' });
    }
  } else if (req.body.type === 'withdraw') {
    const upi = req.body.upiId;
    if (!upi || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim())) {
      return res.status(400).json({ error: 'Please enter a valid UPI ID.' });
    }
    let user = await User.findOne({ id: req.body.username });
    if (!user) {
      user = await User.findOne({ username: req.body.username });
    }
    if (!user) {
      if (req.body.username === 'babu') {
        user = { balance: 999999, save: async () => {} };
      } else {
        return res.status(404).json({ error: 'User not found. Please log out and log back in.' });
      }
    }
    if (user.balance < req.body.amount) {
      return res.status(400).json({ error: 'Insufficient balance for withdrawal.' });
    }
    if (req.body.username !== 'babu') {
      user.balance -= req.body.amount;
      await user.save();
    }
  }
  const tx = new Transaction(req.body);
  await tx.save();

  // If this is a withdrawal request, send a notification to the user
  if (req.body.type === 'withdraw') {
    const notif = new Notification({
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      username: req.body.username,
      message: 'Withdrawal request sent to Admin for approval.',
      type: 'info'
    });
    await notif.save();

    // Notify admin of withdrawal request
    const adminNotif = new Notification({
      id: 'admin_notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      username: 'babu',
      message: `Withdrawal request from ${req.body.username} for ₹${req.body.amount}`,
      type: 'admin'
    });
    await adminNotif.save();
  }

  res.json(tx);
});

app.post('/api/admin/transactions/:txId/action', async (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  const tx = await Transaction.findOne({ id: req.params.txId });
  if (!tx || tx.status !== 'pending') return res.status(400).json({ error: 'Invalid transaction' });

  if (action === 'approve') {
    const user = await User.findOne({ id: tx.username });
    if (user) {
      if (tx.type === 'deposit') {
        user.balance += tx.amount;
        user.hasDeposited = true;
      }
      // Note: Withdrawal balance is already deducted upon request creation.
      await user.save();
    }
  } else if (action === 'reject') {
    const user = await User.findOne({ id: tx.username });
    if (user && tx.type === 'withdraw') {
      user.balance += tx.amount;
      await user.save();
    }
  }
  
  tx.status = action === 'approve' ? 'approved' : 'rejected';
  await tx.save();

  // Create a notification for the user on approval
  if (action === 'approve') {
    let msg = `Request Successful`;
    if (tx.type === 'withdraw') {
      msg = 'Payment pending me chala gaya 5-6 din me wallet me aa jayega';
    }
    const notif = new Notification({
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      username: tx.username,
      message: msg,
      type: 'success'
    });
    await notif.save();
  }

  res.json(tx);
});

// Delete a transaction (admin)
app.delete('/api/admin/transactions/:txId', async (req, res) => {
  const tx = await Transaction.findOneAndDelete({ id: req.params.txId });
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true, deletedId: tx.id });
});

// SETTINGS
app.get('/api/admin/settings', async (req, res) => {
  let settings = await AdminSettings.findOne({ id: 'global' });
  if (!settings) {
    settings = new AdminSettings({ id: 'global', forcedOutcomes: [], lastConsumedRound: 0, roundOutcomes: [] });
    await settings.save();
  }
  res.json(settings);
});

// Get all round outcomes
app.get('/api/admin/round-outcomes', async (req, res) => {
  let settings = await AdminSettings.findOne({ id: 'global' });
  res.json(settings ? (settings.roundOutcomes || []) : []);
});

// Set outcome for ANY specific round
app.post('/api/admin/round-outcomes', async (req, res) => {
  const roundId = Number(req.body.roundId);
  const { outcome } = req.body;
  if (!roundId || !outcome) return res.status(400).json({ error: 'roundId and outcome required' });
  
  let settings = await AdminSettings.findOne({ id: 'global' });
  if (!settings) {
    settings = new AdminSettings({ id: 'global', forcedOutcomes: [], lastConsumedRound: 0, roundOutcomes: [] });
  }
  if (!settings.roundOutcomes) settings.roundOutcomes = [];
  
  // Replace if same roundId already exists
  const idx = settings.roundOutcomes.findIndex(r => Number(r.roundId) === roundId);
  if (idx !== -1) {
    settings.roundOutcomes[idx].outcome = outcome;
  } else {
    settings.roundOutcomes.push({ roundId, outcome });
  }
  settings.markModified('roundOutcomes');
  await settings.save();
  res.json({ success: true, roundOutcomes: settings.roundOutcomes });
});

// Delete outcome for a specific round
app.delete('/api/admin/round-outcomes/:roundId', async (req, res) => {
  const roundId = parseInt(req.params.roundId);
  let settings = await AdminSettings.findOne({ id: 'global' });
  if (settings && settings.roundOutcomes) {
    settings.roundOutcomes = settings.roundOutcomes.filter(r => r.roundId !== roundId);
    settings.markModified('roundOutcomes');
    await settings.save();
  }
  res.json({ success: true, roundOutcomes: settings ? settings.roundOutcomes : [] });
});

// READ outcome for a round - does NOT delete, so ALL users get the same forced cards
app.post('/api/admin/settings/consume', async (req, res) => {
  const roundId = Number(req.body.roundId);
  let settings = await AdminSettings.findOne({ id: 'global' });
  
  if (settings && settings.roundOutcomes && settings.roundOutcomes.length > 0) {
    const entry = settings.roundOutcomes.find(r => Number(r.roundId) === roundId);
    if (entry) {
      return res.json({ outcome: entry.outcome });
    }
  }
  
  res.json({ outcome: 'none' });
});

// Clean up old round outcomes (called after result is shown)
app.post('/api/admin/settings/cleanup', async (req, res) => {
  const roundId = Number(req.body.roundId);
  let settings = await AdminSettings.findOne({ id: 'global' });
  if (settings && settings.roundOutcomes) {
    // Remove outcomes for rounds <= current round (already passed)
    settings.roundOutcomes = settings.roundOutcomes.filter(r => Number(r.roundId) > roundId);
    settings.markModified('roundOutcomes');
    await settings.save();
  }
  res.json({ success: true });
});

// ── LIVE BET TRACKING ──

// User places a bet — record on server
app.post('/api/bets', async (req, res) => {
  const { roundId, username, bets } = req.body;
  // bets = { dragon: 200, tiger: 0, tie: 100, ... }
  if (!roundId || !username || !bets) return res.status(400).json({ error: 'Missing fields' });
  try {
    // Delete old bets for this user in this round (replace with fresh state)
    await RoundBet.deleteMany({ roundId: Number(roundId), username });
    const docs = [];
    for (const [betType, amount] of Object.entries(bets)) {
      if (amount && amount > 0) {
        docs.push({ roundId: Number(roundId), username, betType, amount });
      }
    }
    if (docs.length > 0) await RoundBet.insertMany(docs);
    res.json({ success: true });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin fetches live bet totals for a round
app.get('/api/bets/round/:roundId', async (req, res) => {
  const roundId = Number(req.params.roundId);
  try {
    const bets = await RoundBet.find({ roundId });
    const totals = { dragon: 0, tiger: 0, tie: 0, total: 0 };
    for (const b of bets) {
      if (totals[b.betType] !== undefined) totals[b.betType] += b.amount;
      else totals[b.betType] = b.amount;
      totals.total += b.amount;
    }
    res.json({ roundId, totals, betCount: bets.length });
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── NOTIFICATION ROUTES ──

// Get all unread notifications for a user
app.get('/api/notifications/:username', async (req, res) => {
  try {
    const notifs = await Notification.find({ username: req.params.username, read: false }).sort({ timestamp: -1 });
    res.json(notifs);
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notifId/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate({ id: req.params.notifId }, { read: true }, { new: true });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/:username/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ username: req.params.username, read: false }, { read: true });
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read for a user
app.post('/api/notifications/:username', async (req, res) => {
  try {
    const { message, type } = req.body;
    const notif = new Notification({
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      username: req.params.username,
      message: message || 'New notification',
      type: type || 'info'
    });
    await notif.save();
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GLOBAL ROUND HISTORY ROUTES
app.post('/api/history/record', async (req, res) => {
  try {
    const { roundId, result } = req.body;
    const roundNumber = (roundId % 2000) + 1;
    
    // Upsert to prevent duplicate entries if multiple clients call it
    await RoundHistory.findOneAndUpdate(
      { roundId },
      { roundId, roundNumber, result },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const currentRoundId = Math.floor(Date.now() / 25000);
    const epochStart = currentRoundId - (currentRoundId % 2000);
    
    const history = await RoundHistory.find({ roundId: { $gte: epochStart } })
      .sort({ roundId: 1 })
      .limit(2000);
      
    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── CHAT SYSTEM ROUTES ──

// Fetch chat history for a specific user
app.get('/api/chat/:userId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.params.userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a chat message
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!sender || !message) return res.status(400).json({ error: 'Missing fields' });
    
    const newMsg = new ChatMessage({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      userId: req.params.userId,
      sender,
      message,
      readByAdmin: sender === 'admin', // Admin already read their own message
      readByUser: sender === 'user' // User already read their own message
    });
    await newMsg.save();
    res.json(newMsg);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all messages as read for a specific role
app.put('/api/chat/:userId/read', async (req, res) => {
  try {
    const { role } = req.body; // 'admin' or 'user'
    if (role === 'admin') {
      await ChatMessage.updateMany({ userId: req.params.userId, sender: 'user', readByAdmin: false }, { readByAdmin: true });
    } else if (role === 'user') {
      await ChatMessage.updateMany({ userId: req.params.userId, sender: 'admin', readByUser: false }, { readByUser: true });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get list of active chat sessions and unread count
app.get('/api/admin/chat/users', async (req, res) => {
  try {
    // Get unique users who have sent or received messages
    const users = await ChatMessage.distinct('userId');
    const result = [];
    
    for (const userId of users) {
      const lastMessage = await ChatMessage.findOne({ userId }).sort({ timestamp: -1 });
      const unreadCount = await ChatMessage.countDocuments({ userId, sender: 'user', readByAdmin: false });
      result.push({ userId, lastMessage, unreadCount });
    }
    
    // Sort by most recent message
    result.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA;
    });
    
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;
