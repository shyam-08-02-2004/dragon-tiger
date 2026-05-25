import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { User, Transaction, AdminSettings } from './models.js';

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

app.post('/api/transactions', async (req, res) => {
  const tx = new Transaction(req.body);
  await tx.save();
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
      } else if (tx.type === 'withdraw') {
        if (user.balance < tx.amount) return res.status(400).json({ error: 'Insufficient balance' });
        user.balance -= tx.amount;
      }
      await user.save();
    }
  }
  
  tx.status = action === 'approve' ? 'approved' : 'rejected';
  await tx.save();
  res.json(tx);
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

// Consume outcome for a round (called by frontend when dealing)
app.post('/api/admin/settings/consume', async (req, res) => {
  const roundId = Number(req.body.roundId);
  let settings = await AdminSettings.findOne({ id: 'global' });
  
  // Check roundOutcomes array for this specific roundId
  if (settings && settings.roundOutcomes && settings.roundOutcomes.length > 0) {
    const idx = settings.roundOutcomes.findIndex(r => Number(r.roundId) === roundId);
    if (idx !== -1) {
      const outcome = settings.roundOutcomes[idx].outcome;
      settings.roundOutcomes.splice(idx, 1);
      settings.markModified('roundOutcomes');
      await settings.save();
      return res.json({ outcome });
    }
  }
  
  res.json({ outcome: 'none' });
});

export default app;
