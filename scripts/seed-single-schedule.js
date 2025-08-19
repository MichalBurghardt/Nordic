import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define schemas inline since we can't import TypeScript models
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nordicClientNumber: { type: String, required: true },
  address: String,
  industry: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: String,
  position: String,
  skills: [String],
  experience: String,
  availability: String
}, { timestamps: true });

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
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
// Employee model is needed for refs but not used directly in this script
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for single schedule seeding...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to create realistic schedule from today to end of year
const createRealisticYearSchedule = (assignment, hrUser) => {
  const schedules = [];
  const today = new Date();
  const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
  
  // Assignment details
  const workShift = assignment.workShift || 'Tagschicht';
  
  // Define shift patterns with varied hours (6-10h per day)
  const shiftPatterns = {
    'Tagschicht': [
      { start: 7, hours: 8 },   // 7:00-15:00 (8h)
      { start: 8, hours: 8 },   // 8:00-16:00 (8h) 
      { start: 6, hours: 9 },   // 6:00-15:00 (9h)
      { start: 8, hours: 10 },  // 8:00-18:00 (10h)
      { start: 9, hours: 7 },   // 9:00-16:00 (7h)
      { start: 7, hours: 9 },   // 7:00-16:00 (9h)
      { start: 8, hours: 6 }    // 8:00-14:00 (6h) - short day
    ],
    'Nachtschicht': [
      { start: 22, hours: 8 },  // 22:00-06:00 (8h)
      { start: 23, hours: 7 },  // 23:00-06:00 (7h)
      { start: 21, hours: 9 },  // 21:00-06:00 (9h)
      { start: 22, hours: 10 }  // 22:00-08:00 (10h)
    ],
    'Wechselschicht': [
      { start: 6, hours: 8 },   // 6:00-14:00 (8h)
      { start: 14, hours: 8 },  // 14:00-22:00 (8h)
      { start: 6, hours: 9 },   // 6:00-15:00 (9h)
      { start: 13, hours: 9 }   // 13:00-22:00 (9h)
    ]
  };

  const patterns = shiftPatterns[workShift] || shiftPatterns['Tagschicht'];
  
  // Generate different types of time off periods
  const timeOffPeriods = [];
  
  // 1. SICK LEAVE PERIODS (chorobowe) - 1 to 14 days, can happen 1-3 times per year
  // Only apply to weekdays (Monday-Friday)
  const sickLeavePeriods = Math.floor(Math.random() * 3) + 1; // 1-3 periods
  for (let i = 0; i < sickLeavePeriods; i++) {
    const duration = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const startDay = new Date(today.getTime() + Math.random() * (endOfYear.getTime() - today.getTime() - duration * 24 * 60 * 60 * 1000));
    
    for (let d = 0; d < duration; d++) {
      const currentDay = new Date(startDay);
      currentDay.setDate(startDay.getDate() + d);
      
      // Only add sick leave for weekdays (Monday=1 to Friday=5)
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        timeOffPeriods.push({
          date: currentDay.toDateString(),
          type: 'sick-leave',
          reason: `Zwolnienie lekarskie - dzień ${d + 1}/${duration}`,
          periodId: `sick-${i + 1}`
        });
      }
    }
  }
  
  // 2. VACATION PERIODS (urlopy) - 1 to 21 days, can happen 1-4 times per year
  // Only apply to weekdays (Monday-Friday)
  const vacationPeriods = Math.floor(Math.random() * 4) + 1; // 1-4 periods
  for (let i = 0; i < vacationPeriods; i++) {
    const duration = Math.floor(Math.random() * 21) + 1; // 1-21 days
    const startDay = new Date(today.getTime() + Math.random() * (endOfYear.getTime() - today.getTime() - duration * 24 * 60 * 60 * 1000));
    
    for (let d = 0; d < duration; d++) {
      const currentDay = new Date(startDay);
      currentDay.setDate(startDay.getDate() + d);
      
      // Only add vacation for weekdays (Monday=1 to Friday=5)
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        timeOffPeriods.push({
          date: currentDay.toDateString(),
          type: 'vacation',
          reason: `Urlop wypoczynkowy - dzień ${d + 1}/${duration}`,
          periodId: `vacation-${i + 1}`
        });
      }
    }
  }
  
  // 3. CLIENT BREAK PERIODS (przerwy w pracy z powodu problemów klienta) - 1 to 14 days, can happen 1-3 times per year
  // Only apply to weekdays (Monday-Friday)
  const clientBreakPeriods = Math.floor(Math.random() * 3) + 1; // 1-3 periods
  for (let i = 0; i < clientBreakPeriods; i++) {
    const duration = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const startDay = new Date(today.getTime() + Math.random() * (endOfYear.getTime() - today.getTime() - duration * 24 * 60 * 60 * 1000));
    
    const reasons = [
      'Przerwa w pracy - brak zamówień od klienta',
      'Przerwa w pracy - modernizacja zakładu klienta',
      'Przerwa w pracy - przestój techniczny u klienta',
      'Przerwa w pracy - sezonowe ograniczenie produkcji',
      'Przerwa w pracy - reorganizacja procesów u klienta'
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    for (let d = 0; d < duration; d++) {
      const currentDay = new Date(startDay);
      currentDay.setDate(startDay.getDate() + d);
      
      // Only add client breaks for weekdays (Monday=1 to Friday=5)
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        timeOffPeriods.push({
          date: currentDay.toDateString(),
          type: 'client-break',
          reason: `${reason} - dzień ${d + 1}/${duration}`,
          periodId: `client-break-${i + 1}`
        });
      }
    }
  }
  
  // Create a map for quick lookup
  const timeOffMap = new Map();
  timeOffPeriods.forEach(period => {
    timeOffMap.set(period.date, period);
  });
  
  // Plan working Saturdays (1-3 total, max 1 per month)
  const workingSaturdays = new Set();
  const totalWorkingSaturdays = Math.floor(Math.random() * 3) + 1; // 1-3 Saturdays
  const remainingMonths = Math.ceil((endOfYear.getTime() - today.getTime()) / (30 * 24 * 60 * 60 * 1000));
  
  for (let i = 0; i < Math.min(totalWorkingSaturdays, remainingMonths); i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
    
    // Find Saturdays in this month
    const saturdays = [];
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 6 && !timeOffMap.has(d.toDateString())) { // Saturday and not a time-off day
        saturdays.push(new Date(d));
      }
    }
    
    if (saturdays.length > 0) {
      const randomSaturday = saturdays[Math.floor(Math.random() * saturdays.length)];
      workingSaturdays.add(randomSaturday.toDateString());
    }
  }
  
  // Plan working Sundays (0-2 total, very rare)
  const workingSundays = new Set();
  const totalWorkingSundays = Math.floor(Math.random() * 3); // 0-2 Sundays
  
  for (let i = 0; i < totalWorkingSundays; i++) {
    const randomDay = new Date(today.getTime() + Math.random() * (endOfYear.getTime() - today.getTime()));
    if (randomDay.getDay() === 0 && !timeOffMap.has(randomDay.toDateString())) { // Sunday and not a time-off day
      workingSundays.add(randomDay.toDateString());
    }
  }

  // Count periods for logging
  const totalSickDays = timeOffPeriods.filter(p => p.type === 'sick-leave').length;
  const totalVacationDays = timeOffPeriods.filter(p => p.type === 'vacation').length;
  const totalClientBreakDays = timeOffPeriods.filter(p => p.type === 'client-break').length;

  console.log(`\n📋 Planning realistic schedule with time off periods:`);
  console.log(`   📅 Period: ${today.toLocaleDateString('de-DE')} - ${endOfYear.toLocaleDateString('de-DE')}`);
  console.log(`   🤒 Sick leave: ${sickLeavePeriods} periods, ${totalSickDays} days total`);
  console.log(`   🏖️ Vacations: ${vacationPeriods} periods, ${totalVacationDays} days total`);
  console.log(`   ⏸️ Client breaks: ${clientBreakPeriods} periods, ${totalClientBreakDays} days total`);
  console.log(`   📅 Working Saturdays: ${workingSaturdays.size} days (5-6h each)`);
  console.log(`   📅 Working Sundays: ${workingSundays.size} days`);
  console.log(`   ⏰ Daily hours: 6-10h varied by client needs`);

  
  // Generate individual days from today to end of year
  for (let date = new Date(today); date <= endOfYear; date.setDate(date.getDate() + 1)) {
    const dateString = date.toDateString();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Check if this is a time-off day
    const timeOffInfo = timeOffMap.get(dateString);
    
    // Create schedule for time-off days
    if (timeOffInfo) {
      let scheduleStatus = timeOffInfo.type; // 'sick-leave', 'vacation', 'client-break'
      
      schedules.push({
        employeeId: assignment.employeeId._id,
        clientId: assignment.clientId._id,
        assignmentId: assignment._id,
        startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
        startTime: '00:00',
        endTime: '00:00',
        weeklyHours: 40,
        status: scheduleStatus,
        notes: `${timeOffInfo.reason} (ID: ${timeOffInfo.periodId})`,
        createdBy: hrUser._id
      });
      continue; // Skip to next day
    }
    
    // Handle regular working days and special weekend work
    let shouldWork = false;
    let specialNote = '';
    
    if (isWeekend) {
      // Check if this weekend day is scheduled for work
      if (workingSaturdays.has(dateString) || workingSundays.has(dateString)) {
        shouldWork = true;
        specialNote = dayOfWeek === 6 ? 'Sobota robocza' : 'Niedziela robocza';
      }
    } else {
      // Regular weekday - work unless it's a holiday or time-off
      shouldWork = true;
    }
    
    if (shouldWork) {
      // Select random shift pattern
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      let workingHours = pattern.hours;
      
      // Weekend work is typically shorter
      if (isWeekend) {
        workingHours = Math.floor(Math.random() * 2) + 5; // 5-6 hours on weekends
      }
      
      // Calculate start and end times as strings (HH:MM format)
      const startHour = pattern.start;
      const endHour = (startHour + workingHours) % 24;
      const startTimeStr = `${startHour.toString().padStart(2, '0')}:00`;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;
      
      schedules.push({
        employeeId: assignment.employeeId._id,
        clientId: assignment.clientId._id,
        assignmentId: assignment._id,
        startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
        endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
        startTime: startTimeStr,
        endTime: endTimeStr,
        weeklyHours: 40,
        status: 'planned',
        notes: specialNote || `${workShift} - ${workingHours}h`,
        createdBy: hrUser._id
      });
    }
  }
  
  // Calculate and log summary statistics
  const totalDays = schedules.length;
  const workingDays = schedules.filter(s => s.status === 'planned').length;
  const sickLeaveDays = schedules.filter(s => s.status === 'sick-leave').length;
  const vacationDays = schedules.filter(s => s.status === 'vacation').length;
  const clientBreakDays = schedules.filter(s => s.status === 'client-break').length;
  
  // Estimate working hours (rough calculation based on average 8h per working day)
  const estimatedWorkingHours = workingDays * 8;
  const avgHoursPerWorkDay = 8; // Fixed average since we don't have workingHours field
  
  console.log(`\n📊 Schedule generation summary:`);
  console.log(`   📅 Total schedule entries: ${totalDays}`);
  console.log(`   💼 Working days: ${workingDays} (est. ${estimatedWorkingHours}h total, ${avgHoursPerWorkDay.toFixed(1)}h avg)`);
  console.log(`   🤒 Sick leave days: ${sickLeaveDays}`);
  console.log(`   🏖️ Vacation days: ${vacationDays}`);
  console.log(`   ⏸️ Client break days: ${clientBreakDays}`);
  console.log(`   📊 Work efficiency: ${((workingDays / (workingDays + sickLeaveDays + vacationDays + clientBreakDays)) * 100).toFixed(1)}%`);
  
  return schedules;
};

// Main function to create single schedule
async function createSingleSchedule() {
  try {
    await connectDB();

    // Get all clients sorted by nordicClientNumber (ascending)
    const allClients = await Client.find()
      .sort({ nordicClientNumber: 1 })
      .select('_id name nordicClientNumber');

    if (allClients.length === 0) {
      console.log('❌ No clients found in database');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📋 Found ${allClients.length} clients in database`);
    console.log('Clients sorted by Nordic number:');
    allClients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.nordicClientNumber}: ${client.name}`);
    });

    // Check which clients already have schedules
    const existingSchedules = await Schedule.find()
      .populate('clientId', 'nordicClientNumber name')
      .select('clientId');

    const clientsWithSchedules = new Set(
      existingSchedules.map(schedule => schedule.clientId._id.toString())
    );

    console.log(`\n📅 Found ${existingSchedules.length} existing schedules for ${clientsWithSchedules.size} different clients`);
    
    if (existingSchedules.length > 0) {
      console.log('Clients with existing schedules:');
      const uniqueClients = [...new Set(existingSchedules.map(s => s.clientId.nordicClientNumber))]
        .sort();
      uniqueClients.forEach(clientNumber => {
        const clientName = existingSchedules.find(s => s.clientId.nordicClientNumber === clientNumber)?.clientId.name;
        console.log(`   - ${clientNumber}: ${clientName}`);
      });
    }

    // Find the first client without any schedules
    const clientWithoutSchedule = allClients.find(client => 
      !clientsWithSchedules.has(client._id.toString())
    );

    if (!clientWithoutSchedule) {
      console.log('\n✅ All clients already have schedules created!');
      console.log('🔄 To create schedules for the next week, clear existing schedules first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n🎯 Next client to schedule: ${clientWithoutSchedule.nordicClientNumber} - ${clientWithoutSchedule.name}`);

    // Find assignment for this client (active or pending)
    const assignment = await Assignment.findOne({
      clientId: clientWithoutSchedule._id,
      status: { $in: ['active', 'pending'] }
    })
    .populate({
      path: 'employeeId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .populate('clientId', 'name nordicClientNumber');

    if (!assignment) {
      console.log(`❌ No active assignment found for client ${clientWithoutSchedule.nordicClientNumber}`);
      console.log('   Make sure assignments exist for this client first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n👤 Found assignment: ${assignment.employeeId?.userId?.firstName} ${assignment.employeeId?.userId?.lastName} → ${assignment.clientId.name} (${assignment.position})`);

    // Get HR user for createdBy field
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('❌ No HR user found for createdBy field');
      await mongoose.disconnect();
      return;
    }

    // Create realistic schedule from today to end of year
    console.log(`\n📆 Creating realistic schedule from today to end of year...`);

    const yearlySchedules = createRealisticYearSchedule(assignment, hrUser);
    
    // Save schedules to database
    console.log(`\n💾 Saving ${yearlySchedules.length} schedule entries...`);
    
    const savedSchedules = await Schedule.insertMany(yearlySchedules);
    
    // Calculate detailed statistics
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    
    const workingSchedules = savedSchedules.filter(s => s.status === 'scheduled');
    const sickLeaveSchedules = savedSchedules.filter(s => s.status === 'sick-leave');
    const vacationSchedules = savedSchedules.filter(s => s.status === 'vacation');
    const clientBreakSchedules = savedSchedules.filter(s => s.status === 'client-break');
    
    const totalWorkingHours = workingSchedules.reduce((sum, s) => sum + (s.workingHours || 0), 0);
    const avgHoursPerWorkDay = totalWorkingHours / workingSchedules.length;
    const workEfficiency = ((workingSchedules.length / savedSchedules.length) * 100).toFixed(1);
    
    // Count weekend work
    const weekendWork = workingSchedules.filter(schedule => {
      return schedule.isWeekend;
    }).length;
    
    console.log(`✅ Successfully created ${savedSchedules.length} schedule entries for:`);
    console.log(`   📋 Client: ${assignment.clientId.nordicClientNumber} - ${assignment.clientId.name}`);
    console.log(`   👤 Employee: ${assignment.employeeId?.userId?.firstName} ${assignment.employeeId?.userId?.lastName}`);
    console.log(`   📅 Period: ${today.toLocaleDateString('de-DE')} - ${endOfYear.toLocaleDateString('de-DE')}`);
    console.log(`\n📊 Schedule Breakdown:`);
    console.log(`   � Working days: ${workingSchedules.length} (${totalWorkingHours}h total, ${avgHoursPerWorkDay.toFixed(1)}h avg)`);
    console.log(`   🤒 Sick leave: ${sickLeaveSchedules.length} days`);
    console.log(`   🏖️ Vacation days: ${vacationSchedules.length} days`);
    console.log(`   ⏸️ Client breaks: ${clientBreakSchedules.length} days`);
    console.log(`   📅 Weekend work: ${weekendWork} days`);
    console.log(`   📈 Work efficiency: ${workEfficiency}%`);
    
    // Show sample schedules by type
    console.log(`\n📋 Sample schedule entries:`);
    
    // Working days
    const sampleWork = workingSchedules.slice(0, 3);
    sampleWork.forEach((schedule, index) => {
      const date = new Date(schedule.date);
      const dayName = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'][date.getDay()];
      console.log(`   ${index + 1}. ${dayName} ${date.toLocaleDateString('pl-PL')} - 💼 ${schedule.workingHours}h (${schedule.workDescription})`);
    });
    
    // Time-off examples
    if (sickLeaveSchedules.length > 0) {
      const sickExample = sickLeaveSchedules[0];
      const date = new Date(sickExample.date);
      const dayName = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'][date.getDay()];
      console.log(`   4. ${dayName} ${date.toLocaleDateString('pl-PL')} - 🤒 ${sickExample.workDescription}`);
    }
    
    if (vacationSchedules.length > 0) {
      const vacationExample = vacationSchedules[0];
      const date = new Date(vacationExample.date);
      const dayName = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'][date.getDay()];
      console.log(`   5. ${dayName} ${date.toLocaleDateString('pl-PL')} - 🏖️ ${vacationExample.workDescription}`);
    }
    
    if (savedSchedules.length > 5) {
      console.log(`   ... and ${savedSchedules.length - 5} more entries`);
    }

    // Show summary of all schedules now
    const totalSchedules = await Schedule.countDocuments();
    const totalClients = await Schedule.distinct('clientId').then(ids => ids.length);
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   📅 Total schedules: ${totalSchedules}`);
    console.log(`   🏢 Clients with schedules: ${totalClients}`);
    console.log(`   🏢 Remaining clients: ${allClients.length - totalClients}`);

    if (totalClients < allClients.length) {
      const nextClient = allClients.find(client => 
        !clientsWithSchedules.has(client._id.toString()) && 
        client._id.toString() !== clientWithoutSchedule._id.toString()
      );
      if (nextClient) {
        console.log(`\n🔄 Next client to schedule: ${nextClient.nordicClientNumber} - ${nextClient.name}`);
        console.log('   Run this script again to create their schedule.');
      }
    }

  } catch (error) {
    console.error('❌ Error creating single schedule:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

// Run the seeding
createSingleSchedule();
