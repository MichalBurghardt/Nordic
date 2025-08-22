import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { Employee, Assignment } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for managing jobless employees...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main function to categorize employees without assignments
const categorizeJoblessEmployees = async () => {
  try {
    await connectDB();

    console.log('🏃‍♂️ Starting jobless employee categorization...\n');

    // Get all employees
    const allEmployees = await Employee.find({}).populate('userId', 'firstName lastName');
    console.log(`👥 Total employees: ${allEmployees.length}`);

    // Get employees with any assignments (active + pending)
    const employeesWithAssignments = await Assignment.distinct('employeeId');
    console.log(`💼 Employees with assignments: ${employeesWithAssignments.length}`);

    // Find employees without any assignments
    const joblessEmployees = allEmployees.filter(employee => 
      !employeesWithAssignments.some(assignedId => assignedId.toString() === employee._id.toString())
    );

    console.log(`🚫 Employees without assignments: ${joblessEmployees.length}\n`);

    if (joblessEmployees.length === 0) {
      console.log('✅ All employees have assignments! No need to categorize jobless employees.');
      await mongoose.connection.close();
      return;
    }

    // Define categories with realistic distribution
    const categories = [
      { 
        status: 'awaiting_assignment', 
        label: 'Oczekujący na umowę',
        percentage: 0.5,  // 50% - główna grupa bezrobotnych
        description: 'Pracownicy gotowi do pracy, oczekujący na przydzielenie klienta'
      },
      { 
        status: 'on_leave', 
        label: 'Urlop',
        percentage: 0.25, // 25% - urlopy
        description: 'Pracownicy na urlopie wypoczynkowym lub rodzicielskim'
      },
      { 
        status: 'comp_time', 
        label: 'Wolne za nadgodziny',
        percentage: 0.15, // 15% - wolne za nadgodziny
        description: 'Pracownicy wykorzystujący wolne za przepracowane nadgodziny'
      },
      { 
        status: 'sick_leave', 
        label: 'Chorobowe',
        percentage: 0.1,  // 10% - na chorobowym
        description: 'Pracownicy na zwolnieniu lekarskim'
      }
    ];

    // Shuffle employees for random distribution
    const shuffledEmployees = [...joblessEmployees].sort(() => Math.random() - 0.5);

    let currentIndex = 0;
    const categorizedEmployees = [];

    console.log('📊 Distributing employees into categories:\n');

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Calculate how many employees for this category
      let count;
      if (i === categories.length - 1) {
        // Last category gets remaining employees
        count = shuffledEmployees.length - currentIndex;
      } else {
        count = Math.ceil(joblessEmployees.length * category.percentage);
        // Ensure we don't exceed available employees
        count = Math.min(count, shuffledEmployees.length - currentIndex);
      }

      console.log(`🏷️  ${category.label}: ${count} employees`);
      console.log(`   📝 ${category.description}`);

      // Assign employees to this category
      const categoryEmployees = shuffledEmployees.slice(currentIndex, currentIndex + count);
      
      for (const employee of categoryEmployees) {
        await Employee.findByIdAndUpdate(employee._id, {
          status: category.status,
          statusUpdatedAt: new Date(),
          statusReason: category.description
        });

        categorizedEmployees.push({
          employee: employee,
          status: category.status,
          label: category.label
        });

        console.log(`     👤 ${employee.userId.firstName} ${employee.userId.lastName} → ${category.label}`);
      }

      currentIndex += count;
      console.log('');
    }

    // Summary report
    console.log('📋 CATEGORIZATION COMPLETE');
    console.log('=' * 50);
    console.log(`👥 Total processed: ${categorizedEmployees.length} employees`);
    console.log('');

    // Count by category
    const statusCounts = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Final employee status distribution:');
    statusCounts.forEach(stat => {
      const category = categories.find(c => c.status === stat._id);
      const label = category ? category.label : stat._id;
      console.log(`   ${label}: ${stat.count}`);
    });

    console.log('');
    console.log('✅ Employee categorization completed successfully!');
    console.log('💡 Tip: Run 5-seed-schedules.js next to create work schedules.');

  } catch (error) {
    console.error('❌ Error categorizing jobless employees:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Additional function to reset all employee statuses (for testing)
const resetEmployeeStatuses = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Resetting all employee statuses to "available"...');
    
    const result = await Employee.updateMany(
      {},
      { 
        status: 'available',
        $unset: { 
          statusUpdatedAt: 1,
          statusReason: 1
        }
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} employee statuses to "available"`);
    
  } catch (error) {
    console.error('❌ Error resetting employee statuses:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Check command line arguments
const command = process.argv[2];

if (command === 'reset') {
  console.log('🔄 RESET MODE: All employee statuses will be reset to "available"\n');
  resetEmployeeStatuses();
} else {
  console.log('🏷️  CATEGORIZATION MODE: Jobless employees will be categorized\n');
  categorizeJoblessEmployees();
}

console.log('');
console.log('Usage:');
console.log('  node scripts/6-seed-jobless.js        # Categorize jobless employees');
console.log('  node scripts/6-seed-jobless.js reset  # Reset all statuses to "available"');
