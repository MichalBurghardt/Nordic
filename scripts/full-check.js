import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Assignment, Employee, Client } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const fullCheck = async () => {
  await connectDB();
  
  console.log('=== FULL ASSIGNMENT ANALYSIS ===');
  
  const assignments = await Assignment.find({}).limit(3);
  const employees = await Employee.find({}).limit(3);
  const clients = await Client.find({}).limit(3);
  
  console.log('\nAssignments count:', await Assignment.countDocuments());
  console.log('Employees count:', await Employee.countDocuments());
  console.log('Clients count:', await Client.countDocuments());
  
  console.log('\nSample employee IDs:');
  employees.forEach(emp => {
    console.log(`${emp._id}: ${emp.firstName} ${emp.lastName}`);
  });
  
  console.log('\nSample client IDs:');
  clients.forEach(client => {
    console.log(`${client._id}: ${client.name}`);
  });
  
  console.log('\nSample assignment references:');
  assignments.forEach(assign => {
    console.log(`Assignment ${assign._id}:`);
    console.log(`  Employee ref: ${assign.employeeId}`);
    console.log(`  Client ref: ${assign.clientId}`);
    console.log(`  Position: ${assign.position}`);
    console.log(`  Status: ${assign.status}`);
  });
  
  // Try manual populate
  console.log('\nTrying manual populate...');
  const firstAssignment = assignments[0];
  const employee = await Employee.findById(firstAssignment.employeeId);
  const client = await Client.findById(firstAssignment.clientId);
  
  console.log(`Employee: ${employee ? `${employee.firstName} ${employee.lastName}` : 'NOT FOUND'}`);
  console.log(`Client: ${client ? client.name : 'NOT FOUND'}`);
  
  await mongoose.disconnect();
  console.log('\n=== CHECK COMPLETE ===');
};

fullCheck().catch(console.error);
