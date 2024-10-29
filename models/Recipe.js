// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipeName: {
    type: String,
    required: true
  },
  cuisineType: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String], // Array of ingredient strings
    required: true
  },
  steps: {
    type: String, // Steps as a single string
    required: true
  },
  imageUrl: {
    type: String, // URL or path to the uploaded image
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
