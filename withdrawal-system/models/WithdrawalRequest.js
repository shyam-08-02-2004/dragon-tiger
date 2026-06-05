// models/WithdrawalRequest.js
import mongoose from 'mongoose';

const WithdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  emailVerified: { type: Boolean, default: false },
  kycVerified: { type: Boolean, default: false },
  upiVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  otp: { type: String }, // 6-digit OTP
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WithdrawalRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
