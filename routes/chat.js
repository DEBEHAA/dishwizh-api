import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// Fetch all messages between two users
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error while fetching chat messages' });
  }
});

// Save a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Chat({ sender, receiver, message });
    await newMessage.save();

    res.json(newMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ message: 'Server error while saving chat message' });
  }
});

export default router;
