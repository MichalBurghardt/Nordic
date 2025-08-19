import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkClientNumbers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Client = mongoose.model('Client', new mongoose.Schema({
      name: String,
      nordicClientNumber: String,
      clientReferenceNumber: String
    }));
    
    const clients = await Client.find().limit(5);
    console.log('📊 Pierwsi 5 klientów z numerami:');
    
    clients.forEach((c, i) => {
      console.log(`${i+1}. ${c.name}`);
      console.log(`   Nordic Nr: ${c.nordicClientNumber}`);
      console.log(`   Klient Nr: ${c.clientReferenceNumber}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkClientNumbers();
