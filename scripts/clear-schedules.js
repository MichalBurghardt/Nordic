import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define Schedule schema inline (since we can't import TypeScript models directly)
const ScheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  weeklyHours: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'confirmed', 'in-progress', 'completed', 'cancelled'], default: 'planned' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

async function clearSchedules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count existing schedules
    const existingCount = await Schedule.countDocuments();
    console.log(`Found ${existingCount} existing schedules`);

    if (existingCount > 0) {
      // Delete all schedules
      const result = await Schedule.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} schedules`);
    } else {
      console.log('No schedules found to delete');
    }

    // Verify deletion
    const remainingCount = await Schedule.countDocuments();
    console.log(`Remaining schedules: ${remainingCount}`);

    console.log('=== SCHEDULE CLEANUP COMPLETE ===');
    
  } catch (error) {
    console.error('Error clearing schedules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearSchedules();
