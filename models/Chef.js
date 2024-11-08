// models/Chef.js
import mongoose from 'mongoose';

const chefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  phone: String,
  address: String,
  postalCode: String,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  professionalChef: {
    type: Boolean,
    default: false,
  },
  experience: Number,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users who follow this chef
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }], // Array of chefs this user follows
});

export default mongoose.model('Chef', chefSchema);
