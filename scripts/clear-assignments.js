import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define schemas inline since we can't import TypeScript models
const AssignmentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  position: String,
  startDate: Date,
  endDate: Date,
  maxHours: Number,
  hourlyRate: Number,
  workShift: String,
  status: String
}, { timestamps: true });

const ScheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  weeklyHours: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'confirmed', 'in-progress', 'completed', 'cancelled', 'sick-leave', 'vacation', 'client-break'], default: 'planned' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Create models
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for data cleanup...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearAssignments = async () => {
  try {
    await connectDB();
    
    console.log('\n🧹 Starting database cleanup...\n');
    
    // First, count current assignments and schedules
    const assignmentCount = await Assignment.countDocuments();
    const scheduleCount = await Schedule.countDocuments();
    
    console.log(`📊 Current database status:`);
    console.log(`   📋 Assignments: ${assignmentCount}`);
    console.log(`   📅 Schedules: ${scheduleCount}`);
    
    if (assignmentCount === 0 && scheduleCount === 0) {
      console.log('\n✅ Database is already clean - no assignments or schedules found!');
      return;
    }
    
    console.log('\n⚠️  WARNING: This will permanently delete ALL assignments and schedules!');
    console.log('⏳ Starting deletion in 3 seconds...\n');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all schedules first (due to foreign key constraints)
    console.log('🗑️  Deleting all schedules...');
    const deletedSchedules = await Schedule.deleteMany({});
    console.log(`✅ Deleted ${deletedSchedules.deletedCount} schedules`);
    
    // Delete all assignments
    console.log('🗑️  Deleting all assignments...');
    const deletedAssignments = await Assignment.deleteMany({});
    console.log(`✅ Deleted ${deletedAssignments.deletedCount} assignments`);
    
    // Verify cleanup
    const remainingAssignments = await Assignment.countDocuments();
    const remainingSchedules = await Schedule.countDocuments();
    
    console.log('\n📊 Final database status:');
    console.log(`   📋 Assignments: ${remainingAssignments}`);
    console.log(`   📅 Schedules: ${remainingSchedules}`);
    
    if (remainingAssignments === 0 && remainingSchedules === 0) {
      console.log('\n🎉 SUCCESS! All assignments and schedules have been deleted!');
      console.log('📝 Note: Users, Employees, and Clients remain in the database');
      console.log('🔄 You can now create new assignments and schedules');
    } else {
      console.log('\n❌ Warning: Some data may not have been deleted properly');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

clearAssignments();
