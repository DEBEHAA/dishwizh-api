
import mongoose from 'mongoose';


const chefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: String,
  address: String,
  postalCode: String,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  professionalChef: {
    type: Boolean,
    default: false
  },
  experience: Number
});


export default mongoose.model('Chef', chefSchema);
