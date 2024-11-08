import express from 'express';
import Chef from '../models/Chef.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// Get a chef's profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch chef details
    const chef = await Chef.findOne({ userId }).populate('followers following', 'name email');
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    // Fetch chef's recipes
    const recipes = await Recipe.find({ userId });

    const profileData = {
      name: chef.name || chef.userId.name,
      email: chef.userId.email,
      phone: chef.phone,
      address: chef.address,
      followersCount: chef.followers.length,
      followingCount: chef.following.length,
      recipes,
    };

    res.json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow or unfollow a chef
router.post('/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.params; // Chef to be followed
    const { currentUserId } = req.body; // Logged-in user

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const chefToFollow = await Chef.findOne({ userId });
    const currentUserChef = await Chef.findOne({ userId: currentUserId });

    if (!chefToFollow || !currentUserChef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    const isFollowing = currentUserChef.following.includes(chefToFollow._id);

    if (isFollowing) {
      // Unfollow the chef
      currentUserChef.following = currentUserChef.following.filter((id) => id.toString() !== chefToFollow._id.toString());
      chefToFollow.followers = chefToFollow.followers.filter((id) => id.toString() !== currentUserChef._id.toString());
    } else {
      // Follow the chef
      currentUserChef.following.push(chefToFollow._id);
      chefToFollow.followers.push(currentUserChef._id);
    }

    await currentUserChef.save();
    await chefToFollow.save();

    res.json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
