import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Employee, User } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const debugEmployee = async () => {
  await connectDB();
  
  console.log('=== EMPLOYEE DEBUG ===');
  
  const employee = await Employee.findOne({});
  console.log('Raw employee:', employee);
  
  if (employee.userId) {
    const user = await User.findById(employee.userId);
    console.log('Related user:', user);
  }
  
  // Try populate
  const populatedEmployee = await Employee.findOne({}).populate('userId');
  console.log('Populated employee:', populatedEmployee);
  
  await mongoose.disconnect();
  console.log('=== DEBUG COMPLETE ===');
};

debugEmployee().catch(console.error);
