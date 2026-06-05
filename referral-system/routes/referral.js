// routes/referral.js
import express from 'express';
import * as referralService from '../services/referralService.js';

const router = express.Router();

/**
 * Generate a referral link for the authenticated user.
 */
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    // Generate or retrieve the user's referral code
    const code = await referralService.generateReferralCode(userId);
    const base = process.env.BASE_URL || 'http://localhost:4000';
    const link = `${base}/register?ref=${code}`;
    res.json({ referralLink: link });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Get referral stats for the logged‑in user */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    const stats = await referralService.getReferralStats(userId);
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Paginated referral history */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const history = await referralService.getReferralHistory(userId, page, limit);
    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Claim referral bonus after new user verification */
router.post('/claim', async (req, res) => {
  try {
    const { referrerCode, newUserId } = req.body;
    if (!referrerCode || !newUserId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    // Record the referral (creates a pending record if not exists)
    const referral = await referralService.recordReferral(referrerCode, newUserId);
    // Complete it now that verification is done
    const result = await referralService.completeReferral(referral._id);
    res.json({ success: true, referral: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

/** Track referral code during registration (optional) */
router.post('/track', async (req, res) => {
  try {
    // Placeholder – integrate with your session store if needed
    res.json({ success: true, message: 'Referral code tracked' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
