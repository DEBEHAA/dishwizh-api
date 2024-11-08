import express from 'express';
import Chef from '../models/Chef.js'; 
import User from '../models/User.js'; 
const router = express.Router();

// Get all users or filter users by search query
router.get('/all', async (req, res) => {
  try {
    const { search } = req.query; // Get search query from the request

    let query = {};

    // If a search query exists, filter by name, email, or phone
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Case-insensitive name search
          { email: { $regex: search, $options: 'i' } }, // Case-insensitive email search
          { phone: { $regex: search, $options: 'i' } }, // Case-insensitive phone search
        ],
      };
    }

    // Fetch matching chefs and populate user details (name, email)
    const users = await Chef.find(query).populate('userId', 'name email');

    // Respond with the list of users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error occurred while fetching users' });
  }
});

export default router;
