import express from 'express';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// Get user and recipe analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRecipes = await Recipe.countDocuments();

        // Group by date for daily new users
        const dailyNewUsers = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Group by date for daily new recipes
        const dailyNewRecipes = await Recipe.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({ totalUsers, totalRecipes, dailyNewUsers, dailyNewRecipes });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error while fetching analytics' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

// Get all recipes
router.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('userId', 'name email');
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Server error while fetching recipes' });
    }
});

// Add a new user
router.post('/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json(newUser);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error while adding user' });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
});

// Add a new recipe
router.post('/recipes', async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.json(newRecipe);
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.status(500).json({ message: 'Server error while adding recipe' });
    }
});

// Delete a recipe
router.delete('/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server error while deleting recipe' });
    }
});

export default router;
