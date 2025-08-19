import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import all seeding modules
import { seedUsers } from './1-seed-users.js';
import { seedEmployees } from './2-seed-employees.js';
import { seedClients } from './3-seed-clients.js';
import { seedAssignments } from './4-seed-assignments.js';
import { seedSchedules } from './5-seed-schedules.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for complete seeding...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Complete seeding process in logical business order
const seedComplete = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting complete Nordic Workforce seeding process...');
    console.log('📋 Following real business workflow:\n');
    
    // Step 1: Foundation - Create admin and HR users
    console.log('=' .repeat(60));
    console.log('🏛️  STEP 1: FOUNDATION USERS (Admin & HR)');
    console.log('=' .repeat(60));
    console.log('Creating permanent foundation users for company operations...\n');
    
    await seedUsers();
    
    // Step 2: Workforce - Create employees
    console.log('\n' + '=' .repeat(60));
    console.log('👥 STEP 2: WORKFORCE (Employees)');
    console.log('=' .repeat(60));
    console.log('Building available workforce from EU countries...\n');
    
    await seedEmployees();
    
    // Step 3: Business Partners - Create client companies
    console.log('\n' + '=' .repeat(60));
    console.log('🏢 STEP 3: BUSINESS PARTNERS (Client Companies)');
    console.log('=' .repeat(60));
    console.log('Establishing partnerships with German companies...\n');
    
    await seedClients();
    
    // Step 4: Matching - Create assignments based on available workforce
    console.log('\n' + '=' .repeat(60));
    console.log('📋 STEP 4: WORKFORCE ASSIGNMENTS');
    console.log('=' .repeat(60));
    console.log('Intelligently matching available employees to client needs...\n');
    
    await seedAssignments();
    
    // Step 5: Planning - Create weekly schedules
    console.log('\n' + '=' .repeat(60));
    console.log('📅 STEP 5: WEEKLY SCHEDULES');
    console.log('=' .repeat(60));
    console.log('Creating detailed weekly schedules for active assignments...\n');
    
    await seedSchedules();
    
    // Final summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '🎉'.repeat(20));
    console.log('✅ COMPLETE SEEDING SUCCESSFUL!');
    console.log('🎉'.repeat(20));
    
    console.log('\n📊 Final Database State:');
    console.log('🏛️  Foundation Users: Admin & HR teams created');
    console.log('👥 Workforce: 60 employees from 6 EU countries');
    console.log('🏢 Business Partners: 25 German client companies');
    console.log('📋 Active Assignments: Intelligent employee-client matching');
    console.log('📅 Weekly Schedules: 3 weeks of detailed planning');
    
    console.log('\n⚡ Performance:');
    console.log(`   Total seeding time: ${duration} seconds`);
    console.log(`   Ready for business operations!`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start your Next.js application: npm run dev');
    console.log('   2. Login as admin to view dashboard');
    console.log('   3. Check weekly calendar for scheduled assignments');
    console.log('   4. Monitor employee utilization and client satisfaction');
    
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
    
    return {
      success: true,
      duration: duration,
      message: 'Complete Nordic Workforce database seeded successfully!'
    };

  } catch (error) {
    console.error('\n💥 SEEDING FAILED:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check MongoDB connection string in .env.local');
    console.error('   2. Ensure all model files exist and are correct');
    console.error('   3. Verify no existing data conflicts');
    console.error('   4. Check console for specific error details');
    
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  console.log('🌟 Nordic Workforce Management - Complete Database Seeding');
  console.log('📅 Date:', new Date().toLocaleDateString('de-DE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  console.log('🕐 Time:', new Date().toLocaleTimeString('de-DE'));
  console.log('🎯 Goal: Create complete business-ready database\n');
  
  await connectDB();
  await seedComplete();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedComplete, connectDB };
