import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Assignment } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const quickAssignmentCheck = async () => {
  await connectDB();
  
  const assignment = await Assignment.findOne({});
  console.log('Raw assignment:', assignment);
  
  console.log('\nAssignment fields:');
  console.log('employeeId:', assignment.employeeId);
  console.log('clientId:', assignment.clientId);
  console.log('position:', assignment.position);
  console.log('status:', assignment.status);
  
  await mongoose.disconnect();
};

quickAssignmentCheck().catch(console.error);
