// models/Message.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String }, // text content
  type: { type: String, enum: ['text','image','video','audio','file','gif'], default: 'text' },
  mediaUrl: { type: String }, // URL to uploaded media
  thumbUrl: { type: String }, // thumbnail for images/video
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
