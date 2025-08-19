import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for clearing
import { User, Employee, Client, Assignment, Schedule } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for database clearing...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all data from database
const clearDatabase = async () => {
  try {
    console.log('🧹 Starting complete database cleanup...');
    console.log('⚠️  This will remove ALL data from the database!\n');
    
    // Get current data counts before clearing
    const beforeCounts = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      clients: await Client.countDocuments(),
      assignments: await Assignment.countDocuments(),
      schedules: await Schedule.countDocuments()
    };

    console.log('📊 Current database state:');
    console.log(`   👥 Users: ${beforeCounts.users}`);
    console.log(`   💼 Employees: ${beforeCounts.employees}`);
    console.log(`   🏢 Clients: ${beforeCounts.clients}`);
    console.log(`   📋 Assignments: ${beforeCounts.assignments}`);
    console.log(`   📅 Schedules: ${beforeCounts.schedules}`);
    console.log(`   📊 Total records: ${Object.values(beforeCounts).reduce((a, b) => a + b, 0)}\n`);

    // Clear collections in reverse dependency order
    console.log('🗑️  Clearing collections...');
    
    console.log('   📅 Clearing schedules...');
    await Schedule.deleteMany({});
    
    console.log('   📋 Clearing assignments...');
    await Assignment.deleteMany({});
    
    console.log('   🏢 Clearing clients...');
    await Client.deleteMany({});
    
    console.log('   💼 Clearing employees...');
    await Employee.deleteMany({});
    
    console.log('   👥 Clearing users...');
    await User.deleteMany({});

    // Verify all collections are empty
    const afterCounts = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      clients: await Client.countDocuments(),
      assignments: await Assignment.countDocuments(),
      schedules: await Schedule.countDocuments()
    };

    console.log('\n✅ Database cleanup completed!');
    console.log('📊 Final database state:');
    console.log(`   👥 Users: ${afterCounts.users}`);
    console.log(`   💼 Employees: ${afterCounts.employees}`);
    console.log(`   🏢 Clients: ${afterCounts.clients}`);
    console.log(`   📋 Assignments: ${afterCounts.assignments}`);
    console.log(`   📅 Schedules: ${afterCounts.schedules}`);
    console.log(`   📊 Total records: ${Object.values(afterCounts).reduce((a, b) => a + b, 0)}`);

    const totalRemoved = Object.values(beforeCounts).reduce((a, b) => a + b, 0);
    console.log(`\n🗑️  Removed ${totalRemoved} total records`);
    console.log('💾 Database is now clean and ready for fresh seeding!');

    await mongoose.disconnect();
    console.log('🔌 Database connection closed.');
    
    return {
      success: true,
      removedCounts: beforeCounts,
      message: 'Database cleared successfully!'
    };

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  console.log('🧹 Nordic Workforce - Database Cleanup');
  console.log('📅 Date:', new Date().toLocaleDateString('de-DE'));
  console.log('🕐 Time:', new Date().toLocaleTimeString('de-DE'));
  console.log('🎯 Goal: Complete database cleanup before fresh seeding\n');
  
  await connectDB();
  await clearDatabase();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { clearDatabase, connectDB };
