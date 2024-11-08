import express from 'express';
import multer from 'multer';
import path from 'path';
import Recipe from '../models/Recipe.js'; // Ensure the path to Recipe model is correct

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  }
});

const upload = multer({ storage: storage });

// Fetch all recipes for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId });
    if (!recipes.length) {
      return res.status(404).json({ message: 'No recipes found for this user.' });
    }
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes. Please try again.' });
  }
});

// Create a new recipe with an image upload
router.post('/', upload.single('image'), async (req, res) => {
  const { userId, recipeName, cuisineType, ingredients, steps } = req.body;

  if (!userId || !recipeName || !cuisineType || !steps) {
    return res.status(400).json({
      message: 'Missing required fields: userId, recipeName, cuisineType, or steps.'
    });
  }

  try {
    const recipe = new Recipe({
      userId,
      recipeName,
      cuisineType,
      ingredients: ingredients ? ingredients.split(',').map(item => item.trim()) : [],
      steps,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await recipe.save();
    res.status(201).json({ message: 'Recipe added successfully!', recipe });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ message: 'Failed to add recipe.' });
  }
});

// Update a specific recipe
router.put('/:recipeId', upload.single('image'), async (req, res) => {
  const { recipeName, cuisineType, ingredients, steps } = req.body;

  const updatedFields = {
    recipeName,
    cuisineType,
    ingredients: ingredients ? ingredients.split(',').map(item => item.trim()) : [],
    steps,
  };
  if (req.file) {
    updatedFields.imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.recipeId,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.json({ message: 'Recipe updated successfully!', updatedRecipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe.' });
  }
});

// Delete a specific recipe
router.delete('/:recipeId', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);

    if (!deletedRecipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.json({ message: 'Recipe deleted successfully!' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe.' });
  }
});

export default router;
