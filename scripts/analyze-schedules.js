import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define minimal schemas
const ScheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  notes: String
}, { timestamps: true });

const ClientSchema = new mongoose.Schema({
  name: String,
  nordicClientNumber: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
// Models needed for refs but not used directly
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
mongoose.models.Client || mongoose.model('Client', ClientSchema);
// eslint-disable-next-line @typescript-eslint/no-unused-expressions  
mongoose.models.User || mongoose.model('User', UserSchema);
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

async function analyzeSchedules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const schedules = await Schedule.find()
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('clientId', 'name nordicClientNumber')
      .sort({ startDate: 1 });

    if (schedules.length === 0) {
      console.log('No schedules found');
      return;
    }

    console.log(`\n📊 Schedule Analysis (${schedules.length} total entries):\n`);

    // Group by day of week
    const dayStats = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Analyze hours distribution
    const hoursDistribution = {};
    const weekendWork = [];

    schedules.forEach(schedule => {
      const date = new Date(schedule.startDate);
      const dayName = dayNames[date.getDay()];
      dayStats[dayName]++;

      // Calculate work hours
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      let hours = endHour - startHour;
      if (hours <= 0) hours += 24; // Handle overnight shifts

      if (!hoursDistribution[hours]) {
        hoursDistribution[hours] = 0;
      }
      hoursDistribution[hours]++;

      // Track weekend work
      if (date.getDay() === 0 || date.getDay() === 6) {
        weekendWork.push({
          date: date.toLocaleDateString('de-DE'),
          day: dayName,
          time: `${schedule.startTime}-${schedule.endTime}`,
          hours: hours
        });
      }
    });

    // Display day distribution
    console.log('📅 Work Days Distribution:');
    Object.entries(dayStats).forEach(([day, count]) => {
      console.log(`   ${day}: ${count} days`);
    });

    // Display hours distribution
    console.log('\n⏰ Work Hours Distribution:');
    Object.entries(hoursDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([hours, count]) => {
        console.log(`   ${hours}h shifts: ${count} days`);
      });

    // Display weekend work
    if (weekendWork.length > 0) {
      console.log('\n📅 Weekend Work:');
      weekendWork.forEach((work, index) => {
        console.log(`   ${index + 1}. ${work.day} ${work.date} ${work.time} (${work.hours}h)`);
      });
    }

    // Show first week sample
    console.log('\n📋 First Week Sample:');
    schedules.slice(0, 7).forEach((schedule, index) => {
      const date = new Date(schedule.startDate);
      const dayName = dayNames[date.getDay()];
      const empName = schedule.employeeId?.userId 
        ? `${schedule.employeeId.userId.firstName} ${schedule.employeeId.userId.lastName}`
        : 'Unknown';
      
      console.log(`   ${index + 1}. ${dayName} ${date.toLocaleDateString('de-DE')} ${schedule.startTime}-${schedule.endTime} - ${empName}`);
    });

    // Monthly breakdown
    const monthlyStats = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.startDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = 0;
      }
      monthlyStats[monthKey]++;
    });

    console.log('\n📊 Monthly Distribution:');
    Object.entries(monthlyStats).forEach(([month, count]) => {
      console.log(`   ${month}: ${count} work days`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

analyzeSchedules();
