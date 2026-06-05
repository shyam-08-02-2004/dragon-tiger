// server.js - entry point for chat system
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chatRouter from './routes/chat.js';
import { initSocket } from './socket/chat.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRouter);

// Static folder for uploaded media (if using local storage)
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(PORT, () => console.log(`Chat server listening on port ${PORT}`));
