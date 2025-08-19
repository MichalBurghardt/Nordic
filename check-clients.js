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

async function checkClients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', userSchema);
    
    const clientUsers = await User.find({ role: 'client' });
    console.log('📊 Użytkownicy firm (role: client):');
    console.log('Liczba:', clientUsers.length);
    
    if (clientUsers.length > 0) {
      console.log('\nPrzykładowi użytkownicy firm:');
      clientUsers.slice(0, 5).forEach((user, i) => {
        console.log(`${i+1}. ${user.firstName} ${user.lastName} - ${user.email} - ${user.companyName || 'Brak firmy'}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkClients();
