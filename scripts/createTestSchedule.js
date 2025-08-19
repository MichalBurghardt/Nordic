import mongoose from 'mongoose';

// Connection URL
const MONGODB_URI = 'mongodb://localhost:27017/nordic';

// Schema definitions
const EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ScheduleSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  date: String,
  startTime: String,
  endTime: String,
  description: String,
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled' 
  }
}, { timestamps: true });

async function createTestSchedule() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Employee = mongoose.model('Employee', EmployeeSchema);
    const Client = mongoose.model('Client', ClientSchema);
    const Schedule = mongoose.model('Schedule', ScheduleSchema);

    // Find or create test employee
    let employee = await Employee.findOne({ email: 'employee@nordic.com' });
    if (!employee) {
      employee = new Employee({
        firstName: 'Anna',
        lastName: 'Müller',
        email: 'employee@nordic.com',
        isActive: true
      });
      await employee.save();
      console.log('Test employee created');
    }

    // Find test client
    const client = await Client.findOne({ email: 'test@testcompany.de' });
    if (!client) {
      console.log('Test client not found!');
      return;
    }

    console.log('Found client:', client.name);

    // Create test schedules for current week
    const today = new Date();
    const currentWeek = [];
    
    // Generate dates for current week (Monday to Friday)
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - date.getDay() + 1 + i); // Monday = 1
      currentWeek.push(date.toISOString().split('T')[0]);
    }

    const schedules = [
      {
        employee: employee._id,
        client: client._id,
        date: currentWeek[0], // Monday
        startTime: '09:00',
        endTime: '17:00',
        description: 'Softwareentwicklung - Frontend',
        status: 'confirmed'
      },
      {
        employee: employee._id,
        client: client._id,
        date: currentWeek[1], // Tuesday
        startTime: '10:00',
        endTime: '16:00',
        description: 'Code Review und Testing',
        status: 'scheduled'
      },
      {
        employee: employee._id,
        client: client._id,
        date: currentWeek[2], // Wednesday
        startTime: '09:30',
        endTime: '17:30',
        description: 'Backend API Entwicklung',
        status: 'confirmed'
      },
      {
        employee: employee._id,
        client: client._id,
        date: currentWeek[4], // Friday
        startTime: '08:00',
        endTime: '16:00',
        description: 'Deployment und Dokumentation',
        status: 'scheduled'
      }
    ];

    // Delete existing test schedules
    await Schedule.deleteMany({ client: client._id });
    console.log('Deleted old test schedules');

    // Create new schedules
    for (const scheduleData of schedules) {
      const schedule = new Schedule(scheduleData);
      await schedule.save();
      console.log(`Created schedule for ${scheduleData.date}: ${scheduleData.startTime}-${scheduleData.endTime}`);
    }

    console.log('\nTest schedules created successfully!');
    console.log('Login with test@testcompany.de to view them');

  } catch (error) {
    console.error('Error creating test schedule:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestSchedule();
