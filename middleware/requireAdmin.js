import User from '../models/User.js';

const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    console.log('Received UserID in requireAdmin:', userId); // Debug log

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      console.error('User is not an admin');
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    console.log('User validated as admin');
    next();
  } catch (error) {
    console.error('Admin validation failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default requireAdmin;
