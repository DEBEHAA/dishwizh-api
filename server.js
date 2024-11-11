import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import seedAdminUser from './models/seedAdminUser.js';

import authRoutes from './routes/auth.js';
import chefRouter from './routes/chef.js';
import recipeRoutes from './routes/recipe.js';
import userProfileRoutes from './routes/userProfile.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

dotenv.config(); // Load environment variables

const app = express();
const httpServer = createServer(app);

// CORS Configuration for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware for parsing JSON
app.use(express.json());

// CORS Middleware for Express Routes
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware for request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  throw new Error('MONGODB_URI is undefined. Please check your .env file.');
}

mongoose.set('strictQuery', true);
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await seedAdminUser(); // Seed the admin user after connecting
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);
app.use('/api/userProfile', userProfileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // Chat routes

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'production' ? null : err,
  });
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room for real-time chat
  socket.on('joinRoom', (room) => {
    if (room) {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    } else {
      console.warn(`Room not provided for user ${socket.id}`);
    }
  });

  // Handle message sending
  socket.on('sendMessage', async (data) => {
    try {
      console.log('Message received:', data);

      // Emit message to the room
      io.to(data.room).emit('receiveMessage', data);

      // Save the message to the database
      const newMessage = new Chat({
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        timestamp: Date.now(),
      });
      await newMessage.save();
    } catch (error) {
      console.error('Error saving chat message:', error.message);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Ensure all routes not handled fall back to 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
