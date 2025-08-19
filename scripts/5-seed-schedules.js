import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { Assignment, Schedule } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding schedules...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to get next Monday
const getNextMonday = (date = new Date()) => {
  const nextMonday = new Date(date);
  const dayOfWeek = nextMonday.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday, add 1 day; otherwise, add days to get to next Monday
  nextMonday.setDate(nextMonday.getDate() + daysToAdd);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
};

// Helper function to create time slots for a week based on assignment data
const createWeeklySchedule = (assignment, startOfWeek, hrUser) => {
  const schedules = [];
  const maxHours = assignment.maxHours || 40;
  
  // Define shift patterns based on assignment workShift if available
  const workShift = assignment.workShift || 'Tagschicht';
  const shiftPatterns = {
    'Tagschicht': { start: 8, end: 16 },
    'Nachtschicht': { start: 22, end: 6 },
    'Wechselschicht': { start: 6, end: 14 }
  };

  const shiftInfo = shiftPatterns[workShift] || shiftPatterns['Tagschicht'];
  const hoursPerDay = Math.ceil(maxHours / 5); // Distribute over 5 days
  
  // Create 5 working days (Monday to Friday)
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const workDate = new Date(startOfWeek);
    workDate.setDate(workDate.getDate() + dayOffset);
    
    // Skip weekends
    if (workDate.getDay() === 0 || workDate.getDay() === 6) continue;
    
    // Create start and end times for the day
    const startTime = `${String(shiftInfo.start).padStart(2, '0')}:00`;
    let endHour = shiftInfo.start + hoursPerDay;
    
    // Handle night shift crossing midnight
    if (workShift === 'Nachtschicht' && shiftInfo.end < shiftInfo.start) {
      endHour = shiftInfo.end;
    } else if (endHour > 23) {
      endHour = 23;
    }
    
    const endTime = `${String(endHour).padStart(2, '0')}:00`;

    const schedule = {
      employeeId: assignment.employeeId._id,
      clientId: assignment.clientId._id,
      assignmentId: assignment._id,
      startDate: new Date(workDate),
      endDate: new Date(workDate),
      startTime: startTime,
      endTime: endTime,
      weeklyHours: hoursPerDay,
      status: 'confirmed',
      notes: `${workShift} - ${assignment.position} at ${assignment.clientId.name}`,
      createdBy: hrUser._id
    };
    
    schedules.push(schedule);
  }
  
  return schedules;
};

// Seed schedules based on active assignments from MongoDB
const seedSchedules = async () => {
  try {
    console.log('📅 Starting schedule seeding based on active assignments from MongoDB...');
    console.log('🎯 Rules: One employee = One client, Sorted by client number\n');

    // Clear existing schedules
    await Schedule.deleteMany({});
    console.log('🗑️ Cleared existing schedules');

    // Get active assignments with all necessary data from MongoDB
    console.log('📊 Fetching active assignments from MongoDB...');
    const activeAssignments = await Assignment.find({ status: 'active' })
      .populate({
        path: 'employeeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('clientId', 'name nordicClientNumber address industry');

    if (activeAssignments.length === 0) {
      console.log('⚠️ No active assignments found. Please run 4-seed-assignments.js first.');
      await mongoose.disconnect();
      return [];
    }

    console.log(`✅ Found ${activeAssignments.length} active assignments from database`);

    // Sort assignments by client number to ensure proper calendar order
    activeAssignments.sort((a, b) => {
      const clientA = a.clientId.nordicClientNumber || 'NC-9999';
      const clientB = b.clientId.nordicClientNumber || 'NC-9999';
      return clientA.localeCompare(clientB);
    });

    console.log('\n📋 Active assignments sorted by client number:');
    activeAssignments.forEach((assignment, index) => {
      const empName = assignment.employeeId?.userId ? 
        `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}` : 
        'Unknown Employee';
      console.log(`   ${index + 1}. ${assignment.clientId.nordicClientNumber}: ${empName} → ${assignment.clientId.name} (${assignment.position})`);
    });

    // Get HR users for createdBy field
    const hrUsers = await User.find({ role: 'hr' });
    if (hrUsers.length === 0) {
      throw new Error('No HR users found.');
    }

    const allSchedules = [];

    // Get current week and next 2 weeks for scheduling
    const currentWeek = getNextMonday(new Date());
    const weeksToSchedule = 3;

    console.log(`\n📆 Creating schedules for ${weeksToSchedule} weeks starting from ${currentWeek.toLocaleDateString('de-DE')}`);

    // Create schedules for each week, maintaining client order
    for (let weekOffset = 0; weekOffset < weeksToSchedule; weekOffset++) {
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
      
      console.log(`\n📅 Week ${weekOffset + 1}: ${weekStart.toLocaleDateString('de-DE')}`);

      for (const assignment of activeAssignments) {
        // Only create schedules for assignments that are active during this week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (assignment.startDate <= weekEnd && (!assignment.endDate || assignment.endDate >= weekStart)) {
          const randomHR = hrUsers[Math.floor(Math.random() * hrUsers.length)];
          const weeklySchedules = createWeeklySchedule(assignment, weekStart, randomHR);
          allSchedules.push(...weeklySchedules);
          
          const empName = assignment.employeeId?.userId ? 
            `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}` : 
            'Unknown';
          console.log(`     ✅ ${assignment.clientId.nordicClientNumber}: ${empName} → ${assignment.clientId.name}`);
        }
      }
    }

    console.log(`📋 Generated ${allSchedules.length} schedule entries`);

    if (allSchedules.length === 0) {
      console.log('⚠️ No schedules to create. Check assignment dates and statuses.');
      await mongoose.disconnect();
      return [];
    }

    const createdSchedules = await Schedule.insertMany(allSchedules);
    console.log(`📅 Created ${createdSchedules.length} schedules`);

    // Generate statistics grouped by client number order
    const scheduleStats = {
      byWeek: {},
      byClient: {},
      byPosition: {},
      byShift: {},
      totalHours: 0
    };

    for (const schedule of createdSchedules) {
      const startDate = new Date(schedule.startDate);
      const hours = schedule.weeklyHours;
      
      scheduleStats.totalHours += hours;

      // Week statistics
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday of that week
      const weekLabel = weekStart.toLocaleDateString('de-DE', { month: 'short', day: '2-digit' });
      scheduleStats.byWeek[weekLabel] = (scheduleStats.byWeek[weekLabel] || 0) + hours;

      // Find related assignment for detailed stats
      const relatedAssignment = activeAssignments.find(a => a._id.toString() === schedule.assignmentId.toString());
      if (relatedAssignment) {
        const clientKey = `${relatedAssignment.clientId.nordicClientNumber} - ${relatedAssignment.clientId.name}`;
        scheduleStats.byClient[clientKey] = (scheduleStats.byClient[clientKey] || 0) + hours;
        
        scheduleStats.byPosition[relatedAssignment.position] = (scheduleStats.byPosition[relatedAssignment.position] || 0) + hours;
        
        const shift = relatedAssignment.workShift || 'Tagschicht';
        scheduleStats.byShift[shift] = (scheduleStats.byShift[shift] || 0) + hours;
      }
    }

    console.log('\n📊 Schedule Statistics:');
    
    console.log('\n📅 Hours by Week:');
    Object.entries(scheduleStats.byWeek)
      .sort()
      .forEach(([week, hours]) => {
        console.log(`   Week of ${week}: ${hours} hours`);
      });

    console.log('\n🏢 Hours by Client (sorted by number):');
    Object.entries(scheduleStats.byClient)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([client, hours]) => {
        console.log(`   ${client}: ${hours} hours`);
      });

    console.log('\n💼 Hours by Position:');
    Object.entries(scheduleStats.byPosition)
      .sort(([,a], [,b]) => b - a)
      .forEach(([position, hours]) => {
        console.log(`   ${position}: ${hours} hours`);
      });

    console.log('\n🕐 Hours by Shift:');
    Object.entries(scheduleStats.byShift)
      .sort(([,a], [,b]) => b - a)
      .forEach(([shift, hours]) => {
        console.log(`   ${shift}: ${hours} hours`);
      });

    console.log('\n📈 Summary:');
    console.log(`   Total scheduled hours: ${scheduleStats.totalHours}`);
    console.log(`   Active assignments with schedules: ${activeAssignments.length}`);
    console.log(`   Average hours per assignment: ${(scheduleStats.totalHours / activeAssignments.length).toFixed(1)}`);
    console.log(`   Weekly hours average: ${(scheduleStats.totalHours / weeksToSchedule).toFixed(1)}`);

    // Show calendar preview organized by client number
    console.log('\n📅 Calendar Preview (Current Week) - Sorted by Client Number:');
    const currentWeekSchedules = createdSchedules.filter(schedule => {
      const scheduleWeek = new Date(schedule.startDate);
      scheduleWeek.setDate(scheduleWeek.getDate() - scheduleWeek.getDay() + 1); // Monday
      return scheduleWeek.getTime() === currentWeek.getTime();
    });

    // Group by assignment and sort by client number
    const schedulesGrouped = {};
    currentWeekSchedules.forEach(schedule => {
      const relatedAssignment = activeAssignments.find(a => a._id.toString() === schedule.assignmentId.toString());
      if (relatedAssignment) {
        const key = relatedAssignment.clientId.nordicClientNumber;
        if (!schedulesGrouped[key]) schedulesGrouped[key] = [];
        schedulesGrouped[key].push({ schedule, assignment: relatedAssignment });
      }
    });

    Object.keys(schedulesGrouped)
      .sort()
      .forEach(clientNumber => {
        const items = schedulesGrouped[clientNumber];
        const assignment = items[0].assignment;
        const empName = assignment.employeeId?.userId ? 
          `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}` : 
          'Unknown';
        
        console.log(`\n   ${clientNumber} - ${assignment.clientId.name}:`);
        console.log(`     👤 ${empName} (${assignment.position})`);
        
        items.forEach(({ schedule }) => {
          const day = new Date(schedule.startDate).toLocaleDateString('de-DE', { weekday: 'short' });
          console.log(`     ${day}: ${schedule.startTime}-${schedule.endTime} (${schedule.weeklyHours}h)`);
        });
      });

    await mongoose.disconnect();
    console.log('\n✅ Schedule seeding completed successfully!');
    
    return createdSchedules;

  } catch (error) {
    console.error('❌ Error seeding schedules:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedSchedules();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedSchedules, connectDB };
