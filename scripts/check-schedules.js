import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Schedule, Assignment } from './models-for-seed.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const checkSchedules = async () => {
  await connectDB();
  
  const scheduleCount = await Schedule.countDocuments();
  const assignmentCount = await Assignment.countDocuments({ status: 'active' });
  
  console.log('=== SCHEDULE STATUS ===');
  console.log(`Total schedules: ${scheduleCount}`);
  console.log(`Active assignments: ${assignmentCount}`);
  
  if (scheduleCount > 0) {
    console.log('\n=== WSZYSTKIE HARMONOGRAMY ===');
    const allSchedules = await Schedule.find({})
      .populate({
        path: 'employeeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('clientId', 'name nordicClientNumber address')
      .populate('createdBy', 'firstName lastName email')
      .sort({ startDate: 1 });
      
    allSchedules.forEach((schedule, index) => {
      console.log(`\n--- HARMONOGRAM ${index + 1} ---`);
      console.log(`🆔 ID: ${schedule._id}`);
      
      // Employee details
      const empName = schedule.employeeId?.userId ? 
        `${schedule.employeeId.userId.firstName} ${schedule.employeeId.userId.lastName}` : 
        'Unknown Employee';
      const empEmail = schedule.employeeId?.userId?.email || 'No email';
      const empId = schedule.employeeId?.employeeId || 'No employee ID';
      console.log(`👤 Pracownik: ${empName} (${empId})`);
      console.log(`📧 Email pracownika: ${empEmail}`);
      
      // Client details
      const clientName = schedule.clientId?.name || 'Unknown Client';
      const clientNumber = schedule.clientId?.nordicClientNumber || 'No number';
      console.log(`🏢 Klient: ${clientName} (${clientNumber})`);
      
      // Assignment details
      if (schedule.assignmentId) {
        console.log(`📋 Assignment ID: ${schedule.assignmentId}`);
      }
      
      // Dates and times
      const startDate = schedule.startDate.toLocaleDateString('pl-PL');
      const endDate = schedule.endDate.toLocaleDateString('pl-PL');
      console.log(`📅 Okres: ${startDate} - ${endDate}`);
      console.log(`⏰ Godziny: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`📊 Godziny tygodniowo: ${schedule.weeklyHours}h`);
      
      // Status and notes
      console.log(`📈 Status: ${schedule.status}`);
      if (schedule.notes) {
        console.log(`📝 Notatki: ${schedule.notes}`);
      }
      
      // Created by and dates
      const createdBy = schedule.createdBy ? 
        `${schedule.createdBy.firstName || ''} ${schedule.createdBy.lastName || ''}`.trim() || 
        schedule.createdBy.email : 
        'Unknown';
      console.log(`👨‍💼 Utworzony przez: ${createdBy}`);
      console.log(`📅 Data utworzenia: ${schedule.createdAt?.toLocaleString('pl-PL') || 'Unknown'}`);
      console.log(`📅 Ostatnia modyfikacja: ${schedule.updatedAt?.toLocaleString('pl-PL') || 'Unknown'}`);
      
      // Raw data for debugging
      console.log(`🔍 RAW DATA:`, JSON.stringify({
        _id: schedule._id,
        employeeId: schedule.employeeId?._id,
        clientId: schedule.clientId?._id,
        assignmentId: schedule.assignmentId,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        weeklyHours: schedule.weeklyHours,
        status: schedule.status,
        notes: schedule.notes,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt
      }, null, 2));
    });
  }
  
  await mongoose.disconnect();
  console.log('=== CHECK COMPLETE ===');
};

checkSchedules().catch(console.error);
