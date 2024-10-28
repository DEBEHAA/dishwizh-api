const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register a new user with basic details (name, email, password)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;  // Only collect basic info during registration
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully', user });
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

    res.status(200).json({ msg: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// Get user details by userId
router.get('/userdetails/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);  // Return the user details
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).send('Server error');
  }
});

// Update user details
router.put('/userdetails/:userId', async (req, res) => {
  const { name, email, phone, address, postalCode, age, gender, professionalChef, experience } = req.body;
  
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Log the data received
    console.log('Updating user with data:', req.body);

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.postalCode = postalCode || user.postalCode;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.professionalChef = professionalChef !== undefined ? professionalChef : user.professionalChef;
    user.experience = experience || user.experience;

    // Save the updated user document
    await user.save();
    
    res.status(200).json({ msg: 'User details updated successfully', user });
  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get favorite recipes for a user
router.get('/favorites/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.favorites);  // Return user's favorite recipes
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).send('Server error');
  }
});

// Add a recipe to a user's favorites
router.post('/favorites/:userId', async (req, res) => {
  const { recipe } = req.body;

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the recipe is already in favorites
    const existingFavorite = user.favorites.find(fav => fav.id === recipe.id);
    if (existingFavorite) {
      return res.status(400).json({ msg: 'Recipe already in favorites' });
    }

    // Add the recipe to the user's favorit
    user.favorites.push(recipe);
    await user.save();  // Save the updated user document
    res.status(200).json({ msg: 'Recipe added to favorites' });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).send('Server error');
  }
});

// Remove a recipe from a user's favorites
router.post('/favorites/:userId/remove', async (req, res) => {
  const { recipeId } = req.body;  // Recipe ID to be removed from favorites

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Filter out the recipe from the favorites array
    user.favorites = user.favorites.filter(fav => fav.id !== recipeId);
    await user.save();  // Save the updated user document
    res.status(200).json({ msg: 'Recipe removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).send('Server error');
  }
});
//test crud
module.exports = router;
