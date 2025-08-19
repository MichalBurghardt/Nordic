import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { User, Employee, Client } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const detailedCheck = async () => {
  await connectDB();
  
  console.log('=== DATABASE STATUS ===');
  
  // Users breakdown
  const adminCount = await User.countDocuments({ role: 'admin' });
  const hrCount = await User.countDocuments({ role: 'hr' });
  const clientUserCount = await User.countDocuments({ role: 'client' });
  console.log(`Users: ${adminCount} admin, ${hrCount} HR, ${clientUserCount} client users`);
  
  // Employees by country
  const empByCountry = await Employee.aggregate([
    { $group: { _id: '$address.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('Employees by country:');
  empByCountry.forEach(item => {
    console.log(`  ${item._id}: ${item.count}`);
  });
  
  // Clients by industry
  const clientsByIndustry = await Client.aggregate([
    { $group: { _id: '$industry', count: { $sum: 1 } } }
  ]);
  console.log('Clients by industry:');
  clientsByIndustry.forEach(item => {
    console.log(`  ${item._id}: ${item.count}`);
  });
  
  await mongoose.disconnect();
  console.log('=== CHECK COMPLETE ===');
};

detailedCheck().catch(console.error);
