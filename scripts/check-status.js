import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models
import { User, Employee, Client } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for status check...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check database status
const checkStatus = async () => {
  try {
    console.log('📊 Checking database status...\n');
    
    const counts = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      clients: await Client.countDocuments()
    };

    console.log('Current database state:');
    console.log(`👥 Users: ${counts.users}`);
    console.log(`💼 Employees: ${counts.employees}`);
    console.log(`🏢 Clients: ${counts.clients}`);
    console.log(`📊 Total: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);

    if (counts.users > 0) {
      console.log('\n👥 Sample users:');
      const sampleUsers = await User.find({}).limit(3);
      sampleUsers.forEach(user => {
        console.log(`   ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
      });
    }

    if (counts.employees > 0) {
      console.log('\n💼 Sample employees:');
      const sampleEmployees = await Employee.find({}).limit(3);
      sampleEmployees.forEach(emp => {
        console.log(`   ${emp.firstName} ${emp.lastName} from ${emp.address.country} - ${emp.skills.slice(0, 2).join(', ')}`);
      });
    }

    if (counts.clients > 0) {
      console.log('\n🏢 Sample clients:');
      const sampleClients = await Client.find({}).limit(3);
      sampleClients.forEach(client => {
        console.log(`   ${client.name} in ${client.address.city} - ${client.industry}`);
      });
    }

    await mongoose.disconnect();
    
    return counts;

  } catch (error) {
    console.error('❌ Error checking status:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await checkStatus();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkStatus };
