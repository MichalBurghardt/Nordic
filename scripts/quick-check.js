import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { User, Employee, Client } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
};

const quickCheck = async () => {
  await connectDB();
  
  const userCount = await User.countDocuments();
  const empCount = await Employee.countDocuments();
  const clientCount = await Client.countDocuments();
  
  console.log(`Users: ${userCount}, Employees: ${empCount}, Clients: ${clientCount}`);
  
  await mongoose.disconnect();
};

quickCheck().catch(console.error);
