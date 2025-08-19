import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Employee, Client, Assignment } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding assignments...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to calculate assignment duration (unused but kept for future use)
// const getAssignmentDuration = (startDate, endDate) => {
//   if (!endDate) return 'ongoing';
//   const diff = new Date(endDate) - new Date(startDate);
//   const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
//   return `${days} days`;
// };

// Seed assignments based on available employees and client needs
const seedAssignments = async () => {
  try {
    console.log('📋 Starting intelligent assignment seeding based on real MongoDB data...');
    console.log('🎯 Goal: Create assignments until end of 2025 for qualified employees\n');

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('🗑️ Cleared existing assignments');

    // Get required data from MongoDB
    const hrUsers = await User.find({ role: 'hr' });
    const employees = await Employee.find({}).populate('userId', 'firstName lastName');
    const clients = await Client.find({});

    if (hrUsers.length === 0) {
      throw new Error('No HR users found. Please run 1-seed-users.js first.');
    }
    if (employees.length === 0) {
      throw new Error('No employees found. Please run 2-seed-employees.js first.');
    }
    if (clients.length === 0) {
      throw new Error('No clients found. Please run 3-seed-clients.js first.');
    }

    console.log(`📊 Current resources in MongoDB:`);
    console.log(`   👥 Available employees: ${employees.length}`);
    console.log(`   🏢 Partner clients: ${clients.length}`);
    console.log(`   🏛️ HR staff: ${hrUsers.length}`);
    
    // Contract period - from today until end of 2025
    const contractStart = new Date(); // Today (August 18, 2025)
    const contractEnd = new Date('2025-12-31');
    const contractDays = Math.ceil((contractEnd - contractStart) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Contract period: ${contractStart.toLocaleDateString('de-DE')} to ${contractEnd.toLocaleDateString('de-DE')} (${contractDays} days)`);
    console.log(`🎯 Strategy: Match qualified employees to client needs for remainder of 2025\n`);

    const assignments = [];
    const usedEmployees = new Set();

    // Analyze actual skills vs client needs from MongoDB
    console.log('🔍 Analyzing employee skills vs client requirements...');
    const employeeSkills = {};
    employees.forEach(emp => {
      emp.skills.forEach(skill => {
        if (!employeeSkills[skill]) employeeSkills[skill] = [];
        employeeSkills[skill].push(emp);
      });
    });

    const clientNeeds = {};
    clients.forEach(client => {
      client.preferredPositions.forEach(position => {
        if (!clientNeeds[position]) clientNeeds[position] = [];
        clientNeeds[position].push(client);
      });
    });

    console.log('\n📈 Skill matching analysis:');
    Object.keys(clientNeeds).forEach(position => {
      const needingClients = clientNeeds[position].length;
      const availableEmployees = (employeeSkills[position] || []).length;
      const matchRate = availableEmployees > 0 ? Math.min(needingClients, availableEmployees) : 0;
      
      console.log(`   ${position}: ${needingClients} clients need, ${availableEmployees} qualified employees → ${matchRate} possible matches`);
    });

    console.log('\n🤝 Creating assignments based on perfect skill matches...');

    // Create assignments by matching skills to needs - prioritize perfect matches
    Object.keys(clientNeeds).forEach(position => {
      const needingClients = clientNeeds[position];
      const availableEmployees = employeeSkills[position] || [];

      console.log(`\n🎯 Processing ${position}:`);
      console.log(`   📋 Clients requesting: ${needingClients.length}`);
      console.log(`   👥 Qualified employees: ${availableEmployees.length}`);

      // Sort clients by industry priority (mix for variety)
      const sortedClients = needingClients.sort((a, b) => {
        if (a.industry !== b.industry) {
          return a.industry === 'Logistik' ? -1 : 1; // Logistik first
        }
        return a.name.localeCompare(b.name);
      });

      sortedClients.forEach((client) => {
        // Find best available employee for this position
        const availableEmployee = availableEmployees.find(emp => 
          !usedEmployees.has(emp._id.toString()) && 
          emp.skills.includes(position)
        );
        
        if (availableEmployee && assignments.length < 50) { // Limit to reasonable number
          usedEmployees.add(availableEmployee._id.toString());
          
          const randomHR = hrUsers[Math.floor(Math.random() * hrUsers.length)];
          
          // Determine assignment status based on start timing
          let status, startDate;
          
          // 80% of assignments are active (started), 20% pending (future start)
          const isActive = Math.random() < 0.8;
          
          if (isActive) {
            // Active assignment - started recently
            startDate = new Date(contractStart);
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 14)); // Started up to 14 days ago
            status = 'active';
          } else {
            // Pending assignment - starts soon
            startDate = new Date(contractStart);
            startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1); // Starts in 1-7 days
            status = 'pending';
          }

          const assignment = {
            assignmentNumber: `ASG-2025-${String(assignments.length + 1).padStart(3, '0')}`,
            employeeId: availableEmployee._id,
            clientId: client._id,
            position: position,
            startDate: startDate,
            endDate: new Date('2025-12-31'), // All contracts until end of year
            status: status,
            hourlyRate: availableEmployee.hourlyRate,
            maxHours: 40, // Standard weekly hours
            workLocation: client.address.city,
            workShift: ['Tagschicht', 'Nachtschicht', 'Wechselschicht'][Math.floor(Math.random() * 3)],
            requirements: [
              position === 'Staplerfahrer' ? 'Staplerschein erforderlich' : '',
              position === 'Qualitätsprüfer' ? 'Qualitätskontrolle Erfahrung' : '',
              'Zuverlässigkeit und Pünktlichkeit',
              'Teamfähigkeit',
              position.includes('Montage') ? 'Handwerkliche Fähigkeiten' : '',
              'Deutschkenntnisse Grundstufe'
            ].filter(Boolean),
            description: `Langzeitvertrag ${availableEmployee.userId.firstName} ${availableEmployee.userId.lastName} bei ${client.name} bis 31.12.2025`,
            createdBy: randomHR._id,
            createdAt: new Date(contractStart.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Created within last week
          };

          assignments.push(assignment);
          
          console.log(`   ✅ Match ${assignments.length}: ${availableEmployee.userId.firstName} ${availableEmployee.userId.lastName} → ${client.name} (${client.address.city})`);
        }
      });
    });

    // Remove the secondary assignment creation loop since we're being more strategic
    console.log(`\n📋 Assignment creation completed: ${assignments.length} strategic matches`);

    if (assignments.length === 0) {
      console.log('⚠️ No assignments could be created. Check employee skills vs client requirements.');
      await mongoose.disconnect();
      return [];
    }

    const createdAssignments = await Assignment.insertMany(assignments);
    console.log(`📋 Created ${createdAssignments.length} assignments`);

    // Generate comprehensive statistics
    const statusStats = {};
    const positionStats = {};
    const industryStats = {};
    const cityStats = {};
    const shiftStats = {};
    let totalHourlyValue = 0;
    let totalWeeklyHours = 0;

    for (const assignment of createdAssignments) {
      // Basic stats
      statusStats[assignment.status] = (statusStats[assignment.status] || 0) + 1;
      positionStats[assignment.position] = (positionStats[assignment.position] || 0) + 1;
      shiftStats[assignment.workShift] = (shiftStats[assignment.workShift] || 0) + 1;
      cityStats[assignment.workLocation] = (cityStats[assignment.workLocation] || 0) + 1;
      
      totalHourlyValue += assignment.hourlyRate * assignment.maxHours;
      totalWeeklyHours += assignment.maxHours;

      // Get client industry
      const client = clients.find(c => c._id.toString() === assignment.clientId.toString());
      if (client) {
        industryStats[client.industry] = (industryStats[client.industry] || 0) + 1;
      }
    }

    console.log('\n📊 Assignment Statistics:');
    
    console.log('\n📈 By Status:');
    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = ((count / createdAssignments.length) * 100).toFixed(1);
      console.log(`   ${status}: ${count} (${percentage}%)`);
    });

    console.log('\n💼 By Position:');
    Object.entries(positionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([position, count]) => {
        console.log(`   ${position}: ${count} assignments`);
      });

    console.log('\n🏭 By Industry:');
    Object.entries(industryStats).forEach(([industry, count]) => {
      console.log(`   ${industry}: ${count} assignments`);
    });

    console.log('\n🕐 By Work Shift:');
    Object.entries(shiftStats).forEach(([shift, count]) => {
      console.log(`   ${shift}: ${count} assignments`);
    });

    console.log('\n🌍 By Work Location (top 10):');
    Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} assignments`);
      });

    console.log('\n💰 Financial Analysis (August - December 2025):');
    const contractMonths = 4.4; // From mid-August to end December
    const monthlyValue = totalHourlyValue * 4.33; // Approximate weeks per month
    const totalContractValue = monthlyValue * contractMonths;
    
    console.log(`   Weekly earnings: €${totalHourlyValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);
    console.log(`   Monthly earnings: €${monthlyValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);
    console.log(`   Total contract value (Aug-Dec): €${totalContractValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);
    console.log(`   Average contract hourly rate: €${(totalHourlyValue / totalWeeklyHours).toFixed(2)}`);

    console.log('\n👥 Workforce Utilization:');
    console.log(`   Employees with contracts: ${usedEmployees.size}/${employees.length}`);
    console.log(`   Employment rate: ${((usedEmployees.size / employees.length) * 100).toFixed(1)}%`);
    const remainingEmployees = employees.length - usedEmployees.size;
    console.log(`   Available for additional contracts: ${remainingEmployees} employees`);

    console.log('\n🎯 Contract Distribution:');
    console.log(`   Long-term contracts (until Dec 31): ${createdAssignments.length}`);
    console.log(`   Average weekly hours per contract: ${(totalWeeklyHours / createdAssignments.length).toFixed(1)}h`);
    console.log(`   Peak operational capacity: ${totalWeeklyHours} hours/week`);

    await mongoose.disconnect();
    console.log('\n✅ Assignment seeding completed successfully!');
    
    return createdAssignments;

  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedAssignments();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedAssignments, connectDB };
