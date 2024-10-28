const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String, // Phone number
  },
  address: {
    type: String, // Address
  },
  postalCode: {
    type: String, // Postal code
  },
  age: {
    type: Number, // Age
  },
  gender: {
    type: String, // Gender: 'male', 'female', or 'other'
  },
  professionalChef: {
    type: Boolean, // Is the user a professional chef?
    default: false
  },
  experience: {
    type: Number, // Years of cooking experience
  }
});

module.exports = mongoose.model('User', userSchema);
