const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Route imports
const authRoutes = require('./routes/auth');
const chefRouter = require('./routes/chef');
const recipeRoutes = require('./routes/recipe');

const app = express();

// Middleware
app.use(express.json());

// CORS setup
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173']; // Your frontend origin
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// MongoDB connection using Atlas URI
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("MongoDB URI is not set. Please set MONGODB_URI in the environment variables.");
  process.exit(1); // Exit if no MongoDB URI is provided
}

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
