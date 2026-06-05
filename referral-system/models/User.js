// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  // add any other fields you already use in your app
});

export default mongoose.model('User', UserSchema);
