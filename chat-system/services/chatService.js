// services/chatService.js
import Message from "../models/Message.js";
import User from "../models/User.js";

const BONUS_AMOUNT = 0; // placeholder – not used here

/** Save a new message */
export async function saveMessage(data) {
  const msg = await Message.create(data);
  return msg;
}

/** Mark a message as delivered */
export async function markMessageDelivered(messageId) {
  return Message.findByIdAndUpdate(messageId, { status: "delivered" }, { new: true });
}

/** Mark a message as read */
export async function markMessageRead(messageId) {
  return Message.findByIdAndUpdate(messageId, { status: "read" }, { new: true });
}

/** Get paginated chat history between two users */
export async function getChatHistory(userA, userB, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  const query = {
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA }
    ]
  };
  const msgs = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Message.countDocuments(query);
  return { messages: msgs.reverse(), pagination: { page, limit, total } };
}

/** Search messages for a user */
export async function searchMessages(userId, term, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const query = {
    $and: [
      { $or: [{ senderId: userId }, { receiverId: userId }] },
      { content: { $regex: term, $options: "i" } }
    ]
  };
  const msgs = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Message.countDocuments(query);
  return { messages: msgs, pagination: { page, limit, total } };
}

/** Delete a message */
export async function deleteMessage(messageId, forEveryone = false) {
  if (forEveryone) {
    return Message.findByIdAndDelete(messageId);
  } else {
    // Soft delete for the caller – we just set a flag (optional)
    return Message.findByIdAndUpdate(messageId, { content: "[deleted]", type: "text" }, { new: true });
  }
}

/** Forward a message (creates a new message referencing original) */
export async function forwardMessage({ fromUserId, toUserId, originalMessageId }) {
  const original = await Message.findById(originalMessageId);
  if (!original) throw new Error("Original message not found");
  const newMsg = await Message.create({
    senderId: fromUserId,
    receiverId: toUserId,
    content: original.content,
    type: original.type,
    mediaUrl: original.mediaUrl,
    thumbUrl: original.thumbUrl,
    forwardedFrom: originalMessageId,
  });
  return newMsg;
}

export default {
  saveMessage,
  markMessageDelivered,
  markMessageRead,
  getChatHistory,
  searchMessages,
  deleteMessage,
  forwardMessage,
};
