import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding users...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Admin and HR users - this should be run first and only once
const seedUsers = async () => {
  try {
    console.log('👥 Starting user seeding...');

    // Clear existing users only in development
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    const users = [];

    // Create admin users - these are permanent
    users.push({
      firstName: 'Admin',
      lastName: 'Nordic',
      email: 'admin@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });

    users.push({
      firstName: 'Thomas',
      lastName: 'Müller',
      email: 'thomas.mueller@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });

    users.push({
      firstName: 'Sarah',
      lastName: 'Schmidt',
      email: 'sarah.schmidt@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });

    // Create HR users - these are permanent
    const hrUsers = [
      {
        firstName: 'Anna',
        lastName: 'Kowalski',
        email: 'anna.kowalski@nordic-zeitarbeit.de',
        password: 'hr123',
        role: 'hr'
      },
      {
        firstName: 'Marcus',
        lastName: 'Weber',
        email: 'marcus.weber@nordic-zeitarbeit.de',
        password: 'hr123',
        role: 'hr'
      },
      {
        firstName: 'Lisa',
        lastName: 'Fischer',
        email: 'lisa.fischer@nordic-zeitarbeit.de',
        password: 'hr123',
        role: 'hr'
      },
      {
        firstName: 'David',
        lastName: 'Nowak',
        email: 'david.nowak@nordic-zeitarbeit.de',
        password: 'hr123',
        role: 'hr'
      },
      {
        firstName: 'Julia',
        lastName: 'Wagner',
        email: 'julia.wagner@nordic-zeitarbeit.de',
        password: 'hr123',
        role: 'hr'
      }
    ];

    users.push(...hrUsers);

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users:`);
    console.log(`   - ${createdUsers.filter(u => u.role === 'admin').length} admin users`);
    console.log(`   - ${createdUsers.filter(u => u.role === 'hr').length} HR users`);

    console.log('\n📋 Admin users:');
    createdUsers.filter(u => u.role === 'admin').forEach(user => {
      console.log(`   👤 ${user.firstName} ${user.lastName} - ${user.email}`);
    });

    console.log('\n📋 HR users:');
    createdUsers.filter(u => u.role === 'hr').forEach(user => {
      console.log(`   👤 ${user.firstName} ${user.lastName} - ${user.email}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ User seeding completed successfully!');
    
    return createdUsers;

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedUsers();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedUsers, connectDB };
