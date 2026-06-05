// models/Referral.js
import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  referrerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refereeUserId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  referralCode:   { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'fraud'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  bonusAmount: { type: Number, default: 50 }
});

ReferralSchema.index({ referrerUserId: 1 });

export default mongoose.model('Referral', ReferralSchema);
