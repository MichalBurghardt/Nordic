import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  weeklyHours: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'confirmed', 'active', 'completed', 'cancelled'], default: 'confirmed' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

mongoose.connect('mongodb://localhost:27017/nordic')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    const count = await Schedule.countDocuments();
    console.log(`\nTotal schedules in database: ${count}`);
    
    if (count > 0) {
      const schedules = await Schedule.find().limit(3);
      console.log('\nSample schedules:');
      schedules.forEach((schedule, index) => {
        console.log(`Schedule ${index + 1}:`);
        console.log(`  ID: ${schedule._id}`);
        console.log(`  Employee ID: ${schedule.employeeId}`);
        console.log(`  Client ID: ${schedule.clientId}`);
        console.log(`  Start Date: ${schedule.startDate}`);
        console.log(`  End Date: ${schedule.endDate}`);
        console.log(`  Start Time: ${schedule.startTime}`);
        console.log(`  End Time: ${schedule.endTime}`);
        console.log(`  Status: ${schedule.status}`);
        console.log(`  Weekly Hours: ${schedule.weeklyHours}`);
        console.log('---');
      });
      
      console.log('\nSchedules for current week (2025-08-18):');
      const weekStart = new Date('2025-08-18');
      const weekEnd = new Date('2025-08-24');
      
      const weekSchedules = await Schedule.find({
        $and: [
          { endDate: { $gte: weekStart } },
          { startDate: { $lte: weekEnd } }
        ]
      });
      
      console.log(`Found ${weekSchedules.length} schedules for week starting 2025-08-18`);
      weekSchedules.forEach((schedule, index) => {
        console.log(`  ${index + 1}. ${schedule.startDate.toISOString().split('T')[0]} - ${schedule.endDate.toISOString().split('T')[0]} (${schedule.startTime}-${schedule.endTime})`);
      });
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
