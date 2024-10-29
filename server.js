const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import the path module
const fs = require('fs');


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
app.use(cors());  // Enable CORS

const uri = "mongodb+srv://debejaga2004:UyqHqQ7iOZcNOF35@cluster0.johtj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
app.use('/api/recipe', recipeRoutes);

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
