import mongoose from 'mongoose';

// Uproszczony model User dla sprawdzenia
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect('mongodb+srv://burghardtrecording:YNWxgQJ7YGlJAsvX@cluster0.zqgyq6d.mongodb.net/nordic?retryWrites=true&w=majority');
    
    console.log('📋 Użytkownicy w bazie danych:');
    const users = await User.find({}).select('firstName lastName email role createdAt');
    
    if (users.length === 0) {
      console.log('❌ Brak użytkowników w bazie danych!');
    } else {
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - rola: ${user.role}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Błąd:', err.message);
    process.exit(1);
  }
}

checkUsers();
