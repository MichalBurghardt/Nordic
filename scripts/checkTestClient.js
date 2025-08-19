// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

// Connection URL
const MONGODB_URI = 'mongodb://localhost:27017/nordic';

async function checkTestClient() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check User collection
    const users = await mongoose.connection.db.collection('users').find({ email: 'test@testcompany.de' }).toArray();
    console.log('Users found:', users.length);
    if (users.length > 0) {
      console.log('User data:', {
        email: users[0].email,
        role: users[0].role,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        isActive: users[0].isActive
      });
    }

    // Check Client collection
    const clients = await mongoose.connection.db.collection('clients').find({ email: 'test@testcompany.de' }).toArray();
    console.log('Clients found:', clients.length);
    if (clients.length > 0) {
      console.log('Client data:', {
        name: clients[0].name,
        email: clients[0].email,
        contactPerson: clients[0].contactPerson,
        nordicClientNumber: clients[0].nordicClientNumber,
        isActive: clients[0].isActive
      });
    }

  } catch (error) {
    console.error('Error checking test client:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkTestClient();
