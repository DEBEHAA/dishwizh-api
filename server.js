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
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'], // Allow these origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://dishwizh.netlify.app'],
  credentials: true,
}));
app.use(express.json()); // Parse JSON body

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
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await seedAdminUser(); // Seed the admin user after database connection
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);
app.use('/api/userProfile', userProfileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // Chat routes

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
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

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
