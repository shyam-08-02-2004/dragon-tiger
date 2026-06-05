import mongoose from 'mongoose';
import Referral from '../models/Referral.js';
import User from '../models/User.js'; // Assuming you have a User model
import dotenv from 'dotenv';

dotenv.config();

const BONUS_AMOUNT = 50; // ₹50 bonus per successful referral
const DAILY_REFERRAL_LIMIT = 5; // max referrals per day per referrer

/**
 * Generate a unique referral code for a user.
 * If the user already has a code, reuse it.
 */
export async function generateReferralCode(userId) {
  // Ensure the user exists
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Use existing code if present
  const existingReferral = await Referral.findOne({ referrerUserId: userId });
  if (existingReferral) return existingReferral.referralCode;

  // Create a simple deterministic code – you can replace with a more random generator if needed
  const code = `USER${userId.toString().slice(-6).toUpperCase()}`;

  const referral = new Referral({
    referrerUserId: userId,
    referralCode: code,
  });
  await referral.save();
  return code;
}

/**
 * Record a new referral attempt.
 * Prevent self‑referral and duplicate referrals.
 */
export async function recordReferral(referrerCode, refereeUserId) {
  // Find the referrer by code
  const referrer = await Referral.findOne({ referralCode: referrerCode });
  if (!referrer) throw new Error('Invalid referral code');

  // Self‑referral check
  if (referrer.referrerUserId.toString() === refereeUserId.toString()) {
    throw new Error('Self‑referral is not allowed');
  }

  // Duplicate check – a referee can only be linked once
  const duplicate = await Referral.findOne({ refereeUserId });
  if (duplicate) {
    // If the record already exists and is completed, just return it
    return duplicate;
  }

  // Rate‑limit: max daily referrals per referrer
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await Referral.countDocuments({
    referrerUserId: referrer.referrerUserId,
    createdAt: { $gte: today },
  });
  if (count >= DAILY_REFERRAL_LIMIT) {
    throw new Error('Daily referral limit reached');
  }

  // Create a pending referral record
  const newReferral = new Referral({
    referrerUserId: referrer.referrerUserId,
    refereeUserId,
    referralCode: referrerCode,
    status: 'pending',
    bonusAmount: BONUS_AMOUNT,
  });
  await newReferral.save();
  return newReferral;
}

/**
 * Mark a pending referral as completed after verification.
 */
export async function completeReferral(referralId) {
  const referral = await Referral.findById(referralId);
  if (!referral) throw new Error('Referral not found');
  if (referral.status !== 'pending') return referral; // Idempotent

  // Credit both users – assumes you have a `walletBalance` field on User
  await User.findByIdAndUpdate(referral.referrerUserId, {
    $inc: { walletBalance: BONUS_AMOUNT },
  });
  await User.findByIdAndUpdate(referral.refereeUserId, {
    $inc: { walletBalance: BONUS_AMOUNT },
  });

  referral.status = 'completed';
  referral.completedAt = new Date();
  await referral.save();
  return referral;
}

/**
 * Get aggregated statistics for a referrer.
 */
export async function getReferralStats(userId) {
  const totalInvites = await Referral.countDocuments({ referrerUserId: userId });
  const successful = await Referral.countDocuments({
    referrerUserId: userId,
    status: 'completed',
  });
  const pending = await Referral.countDocuments({
    referrerUserId: userId,
    status: 'pending',
  });
  const earnings = successful * BONUS_AMOUNT;
  return { totalInvites, successful, pending, earnings };
}

/**
 * Get paginated referral history for a user.
 */
export async function getReferralHistory(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const referrals = await Referral.find({ referrerUserId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('refereeUserId', 'username')
    .lean();
  const total = await Referral.countDocuments({ referrerUserId: userId });
  return {
    referrals: referrals.map(r => ({
      date: r.createdAt,
      username: r.refereeUserId?.username || '—',
      status: r.status,
      bonus: r.bonusAmount,
    })),
    pagination: { page, limit, total },
  };
}
