import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Import JWT for token generation
import User from '../models/User.js';  // Make sure the path is correct for your setup

const router = express.Router();

// Register a new user with basic details (name, email, password)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Token expires in 1 hour
    });

    res.status(201).json({ msg: 'User registered successfully', token, userId: user._id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Server error');
  }
});

// Log in a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ msg: 'Login successful', token, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

export default router;
