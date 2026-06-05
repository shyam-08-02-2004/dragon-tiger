// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String },
  walletBalance: { type: Number, default: 0 }, // keep for other features
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
