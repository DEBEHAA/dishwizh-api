import express from 'express';
import Chef from '../models/Chef.js'; 


const router = express.Router();

// Get chef details by userId
router.get('/:userId', async (req, res) => {
  try {
    const chef = await Chef.findOne({ userId: req.params.userId });
    if (!chef) {
      return res.status(404).json({ msg: 'Chef details not found' });
    }
    res.json(chef);
  } catch (err) {
    console.error('Error fetching chef details:', err);
    res.status(500).send('Server error');
  }
});

// Create chef details by userId
router.post('/:userId', async (req, res) => {
  const { phone, address, postalCode, age, gender, professionalChef, experience } = req.body;

  try {
    // Check if a chef entry already exists
    let chef = await Chef.findOne({ userId: req.params.userId });
    if (chef) {
      return res.status(400).json({ msg: 'Chef details already exist. Use update instead.' });
    }

    // Create a new chef entry
    chef = new Chef({
      userId: req.params.userId,
      phone,
      address,
      postalCode,
      age,
      gender,
      professionalChef,
      experience,
    });
    
    await chef.save();
    res.status(201).json({ msg: 'Chef details created successfully', chef });
  } catch (err) {
    console.error('Error creating chef details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update chef details by userId
router.put('/:userId', async (req, res) => {
  const { phone, address, postalCode, age, gender, professionalChef, experience } = req.body;

  try {
    let chef = await Chef.findOne({ userId: req.params.userId });

    if (!chef) {
      return res.status(404).json({ msg: 'Chef details not found. Use create instead.' });
    }

    // Update existing chef details
    chef.phone = phone || chef.phone;
    chef.address = address || chef.address;
    chef.postalCode = postalCode || chef.postalCode;
    chef.age = age || chef.age;
    chef.gender = gender || chef.gender;
    chef.professionalChef = professionalChef !== undefined ? professionalChef : chef.professionalChef;
    chef.experience = experience || chef.experience;

    await chef.save();
    res.status(200).json({ msg: 'Chef details updated successfully', chef });
  } catch (err) {
    console.error('Error updating chef details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


export default router;
