import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// Fetch all messages between two users
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Fetch messages sorted by timestamp
    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error.message);
    res.status(500).json({ message: 'Server error while fetching chat messages' });
  }
});

// Save a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    // Validate required fields
    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: 'All fields are required: sender, receiver, message.' });
    }

    // Save the new message
    const newMessage = new Chat({ sender, receiver, message, timestamp: Date.now() });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving chat message:', error.message);
    res.status(500).json({ message: 'Server error while saving chat message' });
  }
});

export default router;
