// socket/chat.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { markMessageDelivered, markMessageRead } from "../services/chatService.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // map of online users -> socket ids
  const onlineUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.id;
      return next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", socket => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    // broadcast online status to all contacts (simple implementation)
    socket.broadcast.emit("presence", { userId, status: "online" });

    // Join personal room for direct messages
    socket.join(userId);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("presence", { userId, status: "offline" });
    });

    // typing indicator
    socket.on("typing", data => {
      const { to } = data; // recipient userId
      socket.to(to).emit("typing", { from: userId });
    });

    // send a new message
    socket.on("message:new", async data => {
      try {
        const { to, content, type, mediaUrl, thumbUrl, replyTo, forwardedFrom } = data;
        const msg = await Message.create({
          senderId: userId,
          receiverId: to,
          content,
          type,
          mediaUrl,
          thumbUrl,
          replyTo,
          forwardedFrom,
          status: "sent"
        });
        // Emit to receiver if online
        io.to(to).emit("message:new", msg);
        // also emit back to sender (ack)
        socket.emit("message:new", msg);
        // update unread count (could be stored elsewhere)
      } catch (e) {
        console.error(e);
        socket.emit("error", { message: "Message send failed" });
      }
    });

    // delivery receipt from receiver
    socket.on("message:delivered", async data => {
      const { messageId } = data;
      await markMessageDelivered(messageId);
      const msg = await Message.findById(messageId);
      if (msg) io.to(msg.senderId.toString()).emit("message:delivered", { messageId });
    });

    // read receipt
    socket.on("message:read", async data => {
      const { messageId } = data;
      await markMessageRead(messageId);
      const msg = await Message.findById(messageId);
      if (msg) io.to(msg.senderId.toString()).emit("message:read", { messageId });
    });
  });
}
