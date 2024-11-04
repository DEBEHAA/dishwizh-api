import mongoose from 'mongoose';

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
    type: [String], 
    required: true
  },
  steps: {
    type: String, 
    required: true
  },
  imageUrl: {
    type: String, 
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Recipe', recipeSchema);
