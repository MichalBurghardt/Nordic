import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Assignment } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const checkAssignments = async () => {
  await connectDB();
  
  const assignmentCount = await Assignment.countDocuments();
  const activeAssignments = await Assignment.countDocuments({ status: 'active' });
  const pendingAssignments = await Assignment.countDocuments({ status: 'pending' });
  
  console.log('=== ASSIGNMENT STATUS ===');
  console.log(`Total assignments: ${assignmentCount}`);
  console.log(`Active: ${activeAssignments}`);
  console.log(`Pending: ${pendingAssignments}`);
  
  if (assignmentCount > 0) {
    console.log('\nSample assignments:');
    const sampleAssignments = await Assignment.find({})
      .populate({
        path: 'employeeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('clientId', 'name address.city')
      .limit(5);
      
    sampleAssignments.forEach(assign => {
      const empName = assign.employeeId?.userId ? 
        `${assign.employeeId.userId.firstName} ${assign.employeeId.userId.lastName}` : 
        'Unknown Employee';
      console.log(`${assign._id}: ${empName} → ${assign.clientId.name} (${assign.clientId.address.city}) - ${assign.position} - ${assign.status}`);
    });
  }
  
  await mongoose.disconnect();
  console.log('=== CHECK COMPLETE ===');
};

checkAssignments().catch(console.error);
