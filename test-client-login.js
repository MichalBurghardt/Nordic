import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  companyName: String
});

async function testClientUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', userSchema);
    
    // Znajdź pierwszego klienta
    const clientUser = await User.findOne({ role: 'client' });
    
    if (clientUser) {
      console.log('🧪 Test user login details:');
      console.log('Email:', clientUser.email);
      console.log('Password: client123');
      console.log('Name:', clientUser.firstName, clientUser.lastName);
      console.log('Company:', clientUser.companyName);
      console.log('Role:', clientUser.role);
    } else {
      console.log('❌ No client user found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testClientUser();
