const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const chefRouter = require('./routes/chef');

const app = express();

app.use(express.json());
app.use(cors());  // Enable CORS

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/dishwizh')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
