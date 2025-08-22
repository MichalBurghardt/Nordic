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

// Helper function to check if employee is available in given period
const isEmployeeAvailable = (employeeId, startDate, endDate, existingAssignments) => {
  const conflictingAssignments = existingAssignments.filter(assignment => 
    assignment.employeeId.toString() === employeeId.toString() &&
    assignment.status === 'active' &&
    // Check if periods overlap
    (assignment.startDate <= endDate && assignment.endDate >= startDate)
  );
  
  return conflictingAssignments.length === 0;
};

// Function to find matching employees for client requirements
const findMatchingEmployees = (clientRequirements, allEmployees, existingAssignments, startDate, endDate) => {
  const matchingEmployees = [];
  
  console.log(`   🔍 Looking for employees with skills: [${clientRequirements.join(', ')}]`);
  console.log(`   👥 Checking ${allEmployees.length} total employees...`);
  
  for (const employee of allEmployees) {
    // Check if employee has required skills
    const hasRequiredSkills = clientRequirements.some(requirement => 
      employee.skills && employee.skills.includes(requirement)
    );
    
    // Check if employee is available in the time period
    const isAvailable = isEmployeeAvailable(employee._id, startDate, endDate, existingAssignments);
    
    if (hasRequiredSkills && isAvailable) {
      // Calculate match score based on overlapping skills
      const matchingSkills = employee.skills.filter(skill => 
        clientRequirements.includes(skill)
      );
      
      matchingEmployees.push({
        employee,
        matchScore: matchingSkills.length,
        matchingSkills
      });
    }
  }
  
  // Sort by match score (highest first)
  return matchingEmployees.sort((a, b) => b.matchScore - a.matchScore);
};

// Seed assignments based on available employees and client needs
const seedAssignments = async () => {
  try {
    console.log('🎯 Starting intelligent assignment seeding...');
    console.log('📋 Each client gets 1-5 assignments with available employees');
    console.log('🔒 Each employee can only have ONE active contract at a time\n');

    console.log('🗑️ Clearing existing assignments...');
    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('✅ Cleared existing assignments');

    console.log('📊 Loading data from database...');
    // Get required data from MongoDB
    const hrUsers = await User.find({ role: 'hr' });
    console.log(`   👤 HR Users: ${hrUsers.length}`);
    
    // FIX: Pobieraj tylko DOSTĘPNYCH pracowników do umów
    const employees = await Employee.find({ status: 'available' }).populate('userId', 'firstName lastName');
    console.log(`   👥 Available Employees: ${employees.length}`);
    
    // FIX: Pobieraj tylko AKTYWNYCH klientów do umów
    const clients = await Client.find({ isActive: true });
    console.log(`   🏢 Active Clients: ${clients.length}`);

    if (hrUsers.length === 0) {
      throw new Error('No HR users found. Please run 1-seed-users.js first.');
    }
    if (employees.length === 0) {
      throw new Error('No available employees found. Please run 2-seed-employees.js first or check employee statuses.');
    }
    if (clients.length === 0) {
      throw new Error('No active clients found. Please run 3-seed-clients.js first or activate clients.');
    }

    console.log(`📊 Database stats (filtered for assignments):`);
    console.log(`   👥 Available Employees: ${employees.length}`);
    console.log(`   🏢 Active Clients: ${clients.length}`);
    console.log(`   👤 HR Users: ${hrUsers.length}\n`);

    // Contract period: from today to end of year
    const contractStart = new Date();
    const contractEnd = new Date('2025-12-31');
    
    console.log(`📅 Contract period: ${contractStart.toLocaleDateString('de-DE')} - ${contractEnd.toLocaleDateString('de-DE')}\n`);

    const assignments = [];
    const assignmentLog = [];

    // Process each client
    for (const client of clients) {
      console.log(`\n🏢 Processing client: ${client.name} (${client.nordicClientNumber})`);
      console.log(`   📍 Location: ${client.address?.city || 'Unknown'}`);
      console.log(`   🏭 Industry: ${client.industry || 'Unknown'}`);
      
      // Get client requirements based on industry (matching actual employee skills)
      let clientRequirements = [];
      
      switch(client.industry) {
        case 'Logistik':
          clientRequirements = ['Lagerarbeiter', 'Transport', 'Verpackung', 'Wartung'];
          break;
        case 'Produktion':
          clientRequirements = ['Maschinenbedienung', 'Montage', 'Qualitätskontrolle', 'Wartung'];
          break;
        case 'Einzelhandel':
          clientRequirements = ['Lagerarbeiter', 'Verpackung', 'Transport'];
          break;
        case 'Gastronomie':
          clientRequirements = ['Reinigung', 'Lagerarbeiter', 'Verpackung'];
          break;
        case 'Reinigung':
          clientRequirements = ['Reinigung', 'Wartung'];
          break;
        default:
          clientRequirements = ['Lagerarbeiter', 'Maschinenbedienung', 'Reinigung'];
      }
      
      console.log(`   📋 Requirements (based on ${client.industry}): ${clientRequirements.join(', ')}`);

      if (clientRequirements.length === 0) {
        console.log(`   ⚠️ No requirements defined - skipping`);
        continue;
      }

      // Find matching employees for this client
      const matchingEmployees = findMatchingEmployees(
        clientRequirements, 
        employees, 
        assignments, 
        contractStart, 
        contractEnd
      );

      console.log(`   🔍 Found ${matchingEmployees.length} matching employees`);

      if (matchingEmployees.length === 0) {
        console.log(`   ❌ No available employees match requirements`);
        continue;
      }

      // Determine how many employees this client needs (1-5)
      const numberOfAssignments = Math.min(
        Math.floor(Math.random() * 5) + 1, // 1-5 assignments
        matchingEmployees.length // Can't assign more than available
      );

      console.log(`   🎯 Creating ${numberOfAssignments} assignment(s):`);

      // Create assignments with best matching employees
      for (let i = 0; i < numberOfAssignments; i++) {
        const { employee, matchScore, matchingSkills } = matchingEmployees[i];
        
        // Determine assignment status and start date
        let status, startDate;
        const isActive = Math.random() < 0.8; // 80% active, 20% pending
        
        if (isActive) {
          startDate = new Date(contractStart);
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 14)); // Started up to 14 days ago
          status = 'active';
        } else {
          startDate = new Date(contractStart);
          startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1); // Starts in 1-7 days
          status = 'pending';
        }

        // Select primary position from matching skills
        const primaryPosition = matchingSkills[0] || clientRequirements[0];
        
        // Generate unique assignment number
        const assignmentNumber = `ASG-2025-${String(assignments.length + 1).padStart(3, '0')}`;

        const assignment = {
          assignmentNumber,
          employeeId: employee._id,
          clientId: client._id,
          position: primaryPosition,
          startDate: startDate,
          endDate: contractEnd,
          status: status,
          hourlyRate: employee.hourlyRate || (12 + Math.random() * 8), // 12-20 EUR/hour
          maxHours: 40, // Standard weekly hours
          workLocation: client.address?.city || 'Unknown',
          workShift: ['Tagschicht', 'Nachtschicht', 'Wechselschicht'][Math.floor(Math.random() * 3)],
          requirements: [
            `${primaryPosition} - Qualifikation erforderlich`,
            'Zuverlässigkeit und Pünktlichkeit',
            'Teamfähigkeit',
            'Deutschkenntnisse Grundstufe',
            ...(matchingSkills.slice(1).map(skill => `${skill} - Erfahrung vorteilhaft`))
          ],
          description: `Zeitvertrag ${employee.userId.firstName} ${employee.userId.lastName} bei ${client.name} als ${primaryPosition} bis 31.12.2025`,
          createdBy: hrUsers[Math.floor(Math.random() * hrUsers.length)]._id,
          createdAt: new Date(contractStart.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        };

        assignments.push(assignment);
        
        const logEntry = {
          assignmentNumber,
          employeeName: `${employee.userId.firstName} ${employee.userId.lastName}`,
          clientName: client.name,
          clientNumber: client.nordicClientNumber,
          position: primaryPosition,
          status: status,
          matchScore: matchScore,
          matchingSkills: matchingSkills,
          startDate: startDate.toLocaleDateString('de-DE'),
          hourlyRate: assignment.hourlyRate.toFixed(2)
        };
        
        assignmentLog.push(logEntry);
        
        console.log(`     ${i + 1}. ✅ ${employee.userId.firstName} ${employee.userId.lastName} → ${primaryPosition}`);
        console.log(`        📊 Match: ${matchScore}/${clientRequirements.length} skills: ${matchingSkills.join(', ')}`);
        console.log(`        💰 Rate: ${assignment.hourlyRate.toFixed(2)} EUR/h | Status: ${status}`);
      }

      console.log(`   ✅ Created ${numberOfAssignments} assignments for ${client.name}`);
    }

    console.log(`\n📋 Assignment creation completed: ${assignments.length} total assignments`);

    if (assignments.length === 0) {
      console.log('⚠️ No assignments could be created. Check employee skills vs client requirements.');
      await mongoose.disconnect();
      return [];
    }

    // Save assignments to database
    const createdAssignments = await Assignment.insertMany(assignments);
    console.log(`� Saved ${createdAssignments.length} assignments to database`);

    // Generate comprehensive statistics
    console.log(`\n📊 Assignment Statistics:`);
    
    // Status breakdown
    const statusStats = {};
    createdAssignments.forEach(a => {
      statusStats[a.status] = (statusStats[a.status] || 0) + 1;
    });
    console.log(`   📈 Status: ${Object.entries(statusStats).map(([k,v]) => `${k}: ${v}`).join(', ')}`);
    
    // Position breakdown
    const positionStats = {};
    createdAssignments.forEach(a => {
      positionStats[a.position] = (positionStats[a.position] || 0) + 1;
    });
    console.log(`   💼 Positions:`);
    Object.entries(positionStats).forEach(([position, count]) => {
      console.log(`      ${position}: ${count} assignments`);
    });
    
    // Client distribution
    const clientStats = {};
    createdAssignments.forEach(a => {
      const clientId = a.clientId.toString();
      clientStats[clientId] = (clientStats[clientId] || 0) + 1;
    });
    const clientCounts = Object.values(clientStats);
    console.log(`   🏢 Client distribution:`);
    console.log(`      Min assignments per client: ${Math.min(...clientCounts)}`);
    console.log(`      Max assignments per client: ${Math.max(...clientCounts)}`);
    console.log(`      Avg assignments per client: ${(clientCounts.reduce((a,b) => a+b, 0) / clientCounts.length).toFixed(1)}`);
    
    // Employee utilization
    const usedEmployees = new Set(createdAssignments.map(a => a.employeeId.toString()));
    console.log(`   👥 Employee utilization: ${usedEmployees.size}/${employees.length} (${((usedEmployees.size/employees.length)*100).toFixed(1)}%)`);
    
    // Financial overview
    const totalValue = createdAssignments.reduce((sum, a) => sum + (a.hourlyRate * a.maxHours * 20), 0); // 20 weeks approx
    console.log(`   💰 Estimated total contract value: ${totalValue.toLocaleString('de-DE')} EUR`);

    console.log(`\n✅ Assignment seeding completed successfully!`);
    console.log(`📝 Ready for next step: Run 5-seed-schedules.js to create detailed schedules`);
    
    return createdAssignments;

  } catch (error) {
    console.error('❌ Error during assignment seeding:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 STARTING assignment seeding process...');
    await connectDB();
    console.log('🔗 Connected to database successfully');
    await seedAssignments();
    console.log('✅ Assignment seeding function completed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Disconnected from MongoDB');
    console.log('🏁 PROCESS FINISHED');
  }
};

// Run if called directly
console.log('🔧 Script starting...');
main().catch(console.error);

export { seedAssignments, connectDB };
