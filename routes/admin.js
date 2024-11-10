import express from 'express';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import requireAdmin from '../middleware/requireAdmin.js'; // Middleware to ensure admin access

const router = express.Router();

// Get user and recipe analytics (Admin Only)
router.post('/analytics', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const pendingRecipes = await Recipe.countDocuments({ status: 'pending' });
    const approvedRecipes = await Recipe.countDocuments({ status: 'approved' });

    // Group by date for daily new users
    const dailyNewUsers = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    // Group by date for daily new recipes
    const dailyNewRecipes = await Recipe.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    res.status(200).json({
      totalUsers,
      totalRecipes,
      pendingRecipes,
      approvedRecipes,
      dailyNewUsers,
      dailyNewRecipes,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// Get all users (Admin Only)
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get all recipes (Admin Only)
router.post('/recipes', requireAdmin, async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('userId', 'name email');
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error while fetching recipes' });
  }
});

// Get pending recipes (Admin Only)
router.get('/recipes/pending', requireAdmin, async (req, res) => {
  try {
    const pendingRecipes = await Recipe.find({ status: 'pending' }).populate('userId', 'name email');
    res.status(200).json(pendingRecipes);
  } catch (error) {
    console.error('Error fetching pending recipes:', error);
    res.status(500).json({ message: 'Server error while fetching pending recipes' });
  }
});

// Approve a recipe (Admin Only)
router.put('/recipes/approve/:id', requireAdmin, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }
    res.status(200).json({ message: 'Recipe approved successfully!', recipe });
  } catch (error) {
    console.error('Error approving recipe:', error);
    res.status(500).json({ message: 'Server error while approving recipe.' });
  }
});

// Add a new user (Admin Only)
router.post('/users/create', requireAdmin, async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error while adding user' });
  }
});

// Update a user (Admin Only)
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// Delete a user (Admin Only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Add a new recipe (Admin Only)
router.post('/recipes/create', requireAdmin, async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ message: 'Server error while adding recipe' });
  }
});

// Delete a recipe (Admin Only)
router.delete('/recipes/:id', requireAdmin, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Server error while deleting recipe' });
  }
});

export default router;
