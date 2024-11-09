import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Create HTTP server
import { Server } from 'socket.io'; // Import Socket.IO

import authRoutes from './routes/auth.js';
import chefRouter from './routes/chef.js';
import recipeRoutes from './routes/recipe.js';
import userProfileRoutes from './routes/userProfile.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

dotenv.config(); // Load environment variables

const app = express();
const httpServer = createServer(app); // Create HTTP server for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'], // Frontend URLs
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  throw new Error('MONGODB_URI is undefined. Please check your .env file.');
}

mongoose.set('strictQuery', true);
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);
app.use('/api/userProfile', userProfileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'production' ? null : err,
  });
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for chat messages
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);
    io.to(data.room).emit('receiveMessage', data); // Send message to specific room
  });

  // Join a chat room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
