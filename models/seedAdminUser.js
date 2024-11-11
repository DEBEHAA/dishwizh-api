import User from './User.js'; // Correct relative path to User.js
import bcrypt from 'bcryptjs';

const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('123', 10); // Hash the default password
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        isAdmin: true,
      });

      await adminUser.save();
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export default seedAdminUser;
