import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import chefRouter from './routes/chef.js';
import recipeRoutes from './routes/recipe.js';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware setup
app.use(cors({
  origin: 'https://dishwizh.netlify.app', // Allow requests from frontend
  credentials: true,
}));

app.use(express.json()); // Middleware to parse JSON requests

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

// Set strictQuery to prepare for Mongoose 7 change
mongoose.set('strictQuery', true);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
