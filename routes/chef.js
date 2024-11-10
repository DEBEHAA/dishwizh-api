import express from 'express';
import Chef from '../models/Chef.js';
import mongoose from 'mongoose';

const router = express.Router();

// Fetch all chefs or filter by search query
router.get('/all', async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const chefs = await Chef.find(query).populate('userId', 'name email');
    res.json(chefs);
  } catch (error) {
    console.error('Error fetching chefs:', error);
    res.status(500).json({ message: 'Server error occurred while fetching chefs' });
  }
});

// Fetch chef details by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId as ObjectId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const chef = await Chef.findOne({ userId }).populate('followers following', 'name email');
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    res.json(chef);
  } catch (error) {
    console.error('Error fetching chef details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new chef details
router.post('/', async (req, res) => {
  const { userId, phone, address, postalCode, age, gender, professionalChef, experience } = req.body;

  try {
    // Check if chef already exists
    const existingChef = await Chef.findOne({ userId });
    if (existingChef) {
      return res.status(400).json({ message: 'Chef details already exist. Use PUT to update.' });
    }

    const chef = new Chef({
      userId,
      phone,
      address,
      postalCode,
      age,
      gender,
      professionalChef,
      experience,
    });

    await chef.save();
    res.status(201).json({ message: 'Chef details added successfully!', chef });
  } catch (error) {
    console.error('Error adding chef details:', error);
    res.status(500).json({ message: 'Server error occurred while adding chef details.' });
  }
});

// Update existing chef details
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { phone, address, postalCode, age, gender, professionalChef, experience } = req.body;

  try {
    // Validate userId as ObjectId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const chef = await Chef.findOne({ userId });
    if (!chef) {
      return res.status(404).json({ message: 'Chef not found. Use POST to add details.' });
    }

    // Update chef details
    chef.phone = phone || chef.phone;
    chef.address = address || chef.address;
    chef.postalCode = postalCode || chef.postalCode;
    chef.age = age || chef.age;
    chef.gender = gender || chef.gender;
    chef.professionalChef = professionalChef !== undefined ? professionalChef : chef.professionalChef;
    chef.experience = experience || chef.experience;

    await chef.save();
    res.status(200).json({ message: 'Chef details updated successfully!', chef });
  } catch (error) {
    console.error('Error updating chef details:', error);
    res.status(500).json({ message: 'Server error occurred while updating chef details.' });
  }
});

export default router;
