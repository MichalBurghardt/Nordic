import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Client, Employee, Assignment, Schedule } from './scripts/models-for-seed.js';

const testModels = async () => {
  try {
    console.log('Testing models...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    console.log('\n🧪 Testing User creation...');
    try {
      const testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
        role: 'admin'
      });
      console.log('✅ User created:', testUser._id);
    } catch (error) {
      console.error('❌ User creation failed:', error.message);
    }
    
    console.log('\n🧪 Testing Client creation...');
    try {
      const testClient = await Client.create({
        name: 'Test Client',
        contactEmail: 'client@example.com',
        address: 'Test Address',
        industry: 'logistics'
      });
      console.log('✅ Client created:', testClient._id);
    } catch (error) {
      console.error('❌ Client creation failed:', error.message);
    }
    
    console.log('\n📊 Current counts:');
    console.log('Users:', await User.countDocuments());
    console.log('Clients:', await Client.countDocuments());
    console.log('Employees:', await Employee.countDocuments());
    console.log('Assignments:', await Assignment.countDocuments());
    console.log('Schedules:', await Schedule.countDocuments());
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testModels();
