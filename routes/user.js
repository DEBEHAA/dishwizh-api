import express from 'express';
import Chef from '../models/Chef.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// Fetch user profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const chef = await Chef.findOne({ userId }).populate('followers following', 'name email');
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    const recipes = await Recipe.find({ userId });

    res.json({
      name: chef.userId?.name || chef.name,
      email: chef.userId?.email || chef.email,
      phone: chef.phone,
      address: chef.address,
      followersCount: chef.followers.length,
      followingCount: chef.following.length,
      recipes,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
