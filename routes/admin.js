import express from 'express';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// Get user and recipe analytics (Accessible to all users)
router.post('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const pendingRecipes = await Recipe.countDocuments({ status: 'pending' });
    const approvedRecipes = await Recipe.countDocuments({ status: 'approved' });

    const dailyNewUsers = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyNewRecipes = await Recipe.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRecipes,
        pendingRecipes,
        approvedRecipes,
        dailyNewUsers,
        dailyNewRecipes,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching analytics.' });
  }
});

// Get all users (Accessible to all users)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found.' });
    }
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users.' });
  }
});

// Get all recipes (Accessible to all users)
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('userId', 'name email')
      .select('recipeName status userId ingredients steps createdAt');
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'No recipes found.' });
    }
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching recipes.' });
  }
});

// Approve a recipe (Accessible to all users)
router.put('/recipes/approve/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }
    res.status(200).json({ success: true, message: 'Recipe approved successfully.', data: recipe });
  } catch (error) {
    console.error('Error approving recipe:', error);
    res.status(500).json({ success: false, message: 'Server error while approving recipe.' });
  }
});

// Delete a user (Accessible to all users)
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user.' });
  }
});

// Delete a recipe (Accessible to all users)
router.delete('/recipes/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }
    res.status(200).json({ success: true, message: 'Recipe deleted successfully.' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting recipe.' });
  }
});

// Add a new user (Accessible to all users)
router.post('/users/create', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ success: false, message: 'Server error while adding user.' });
  }
});

export default router;
