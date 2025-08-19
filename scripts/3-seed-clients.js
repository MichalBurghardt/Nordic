import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Client } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding clients...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed clients and their users - run after users are created
const seedClients = async () => {
  try {
    console.log('🏢 Starting client seeding...');

    // Clear existing clients
    await Client.deleteMany({});
    console.log('🗑️ Cleared existing clients');

    // Get admin users to assign as client creators
    const adminUsers = await User.find({ role: 'admin' });
    if (adminUsers.length === 0) {
      throw new Error('No admin users found. Please run 1-seed-users.js first.');
    }

    const clients = [];
    const clientUsers = [];

    // German companies data - these would be our real clients
    const clientCompanies = [
      // Logistics companies
      {
        name: 'Deutsche Logistik Berlin GmbH',
        city: 'Berlin',
        postalCode: '10115',
        industry: 'Logistik',
        contact: 'Klaus Müller',
        positions: ['Lagerarbeiter', 'Staplerfahrer', 'Kommissionierer']
      },
      {
        name: 'SpeedTrans Frankfurt am Main GmbH',
        city: 'Frankfurt am Main',
        postalCode: '60311',
        industry: 'Logistik',
        contact: 'Andrea Weber',
        positions: ['Lagerarbeiter', 'Montagehelfer']
      },
      {
        name: 'CargoMax München GmbH',
        city: 'München',
        postalCode: '80331',
        industry: 'Logistik',
        contact: 'Stefan Bauer',
        positions: ['Qualitätsprüfer', 'Kommissionierer']
      },
      {
        name: 'LogiPartner Dortmund GmbH',
        city: 'Dortmund',
        postalCode: '44135',
        industry: 'Logistik',
        contact: 'Petra Schmidt',
        positions: ['Lagerarbeiter', 'Montagehelfer']
      },
      {
        name: 'FastCargo Düsseldorf GmbH',
        city: 'Düsseldorf',
        postalCode: '40213',
        industry: 'Logistik',
        contact: 'Michael Fischer',
        positions: ['Lagerarbeiter', 'Montagehelfer']
      },
      {
        name: 'TransEuro Dresden GmbH',
        city: 'Dresden',
        postalCode: '01067',
        industry: 'Logistik',
        contact: 'Sabine Wagner',
        positions: ['Staplerfahrer']
      },
      {
        name: 'GlobalFreight Köln GmbH',
        city: 'Köln',
        postalCode: '50667',
        industry: 'Logistik',
        contact: 'Thomas Hoffmann',
        positions: ['Lagerarbeiter', 'Kommissionierer']
      },
      {
        name: 'EuroFreight Stuttgart GmbH',
        city: 'Stuttgart',
        postalCode: '70173',
        industry: 'Logistik',
        contact: 'Julia Becker',
        positions: ['Qualitätsprüfer']
      },
      {
        name: 'Deutsche Logistik Bremen GmbH',
        city: 'Bremen',
        postalCode: '28195',
        industry: 'Logistik',
        contact: 'Daniel Schulz',
        positions: ['Qualitätsprüfer']
      },
      {
        name: 'TransConnect Essen GmbH',
        city: 'Essen',
        postalCode: '45127',
        industry: 'Logistik',
        contact: 'Martina Meyer',
        positions: ['Montagehelfer']
      },

      // Production companies
      {
        name: 'AutoParts Bochum GmbH',
        city: 'Bochum',
        postalCode: '44787',
        industry: 'Produktion',
        contact: 'Robert Klein',
        positions: ['Staplerfahrer', 'Produktionshelfer']
      },
      {
        name: 'MetallWerk Wuppertal GmbH',
        city: 'Wuppertal',
        postalCode: '42103',
        industry: 'Produktion',
        contact: 'Christine Wolf',
        positions: ['Qualitätsprüfer', 'Montagehelfer']
      },
      {
        name: 'ChemieIndustrie Chemnitz GmbH',
        city: 'Chemnitz',
        postalCode: '09111',
        industry: 'Produktion',
        contact: 'Frank Neumann',
        positions: ['Produktionshelfer']
      },
      {
        name: 'ElektroTech Bonn GmbH',
        city: 'Bonn',
        postalCode: '53111',
        industry: 'Produktion',
        contact: 'Anja Richter',
        positions: ['Montagehelfer']
      },
      {
        name: 'ProdTech Karlsruhe GmbH',
        city: 'Karlsruhe',
        postalCode: '76131',
        industry: 'Produktion',
        contact: 'Uwe Lange',
        positions: ['Lagerarbeiter']
      },
      {
        name: 'MetallWerk Braunschweig GmbH',
        city: 'Braunschweig',
        postalCode: '38100',
        industry: 'Produktion',
        contact: 'Karin Zimmermann',
        positions: ['Qualitätsprüfer', 'Staplerfahrer']
      },
      {
        name: 'AutoParts Mönchengladbach GmbH',
        city: 'Mönchengladbach',
        postalCode: '41061',
        industry: 'Produktion',
        contact: 'Jürgen Braun',
        positions: ['Kommissionierer', 'Staplerfahrer']
      },
      {
        name: 'ElektroTech Kiel GmbH',
        city: 'Kiel',
        postalCode: '24103',
        industry: 'Produktion',
        contact: 'Monika Schwarz',
        positions: ['Staplerfahrer']
      },
      {
        name: 'MaschinenBau Münster GmbH',
        city: 'Münster',
        postalCode: '48143',
        industry: 'Produktion',
        contact: 'Helmut Koch',
        positions: ['Montagehelfer']
      },
      {
        name: 'ChemieIndustrie Bielefeld GmbH',
        city: 'Bielefeld',
        postalCode: '33602',
        industry: 'Produktion',
        contact: 'Beate Werner',
        positions: ['Lagerarbeiter']
      },
      {
        name: 'IndustrieWerk Augsburg GmbH',
        city: 'Augsburg',
        postalCode: '86150',
        industry: 'Produktion',
        contact: 'Peter Krause',
        positions: ['Kommissionierer']
      },
      {
        name: 'TechProd Hannover GmbH',
        city: 'Hannover',
        postalCode: '30159',
        industry: 'Produktion',
        contact: 'Silke Hartmann',
        positions: ['Produktionshelfer', 'Qualitätsprüfer']
      },
      {
        name: 'MetallIndustrie Magdeburg GmbH',
        city: 'Magdeburg',
        postalCode: '39104',
        industry: 'Produktion',
        contact: 'Roland Schmitt',
        positions: ['Staplerfahrer', 'Montagehelfer']
      },
      {
        name: 'AutoTech Erfurt GmbH',
        city: 'Erfurt',
        postalCode: '99084',
        industry: 'Produktion',
        contact: 'Gisela Müller',
        positions: ['Lagerarbeiter', 'Qualitätsprüfer']
      },
      {
        name: 'ProdSystems Mainz GmbH',
        city: 'Mainz',
        postalCode: '55116',
        industry: 'Produktion',
        contact: 'Alexander Weber',
        positions: ['Produktionshelfer', 'Staplerfahrer']
      }
    ];

    // Create clients and their user accounts
    for (let i = 0; i < clientCompanies.length; i++) {
      const company = clientCompanies[i];
      const randomAdmin = adminUsers[Math.floor(Math.random() * adminUsers.length)];
      
      // Generate company email domain
      const emailDomain = company.name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/gmbh|ag|kg|ohg/g, '')
        .replace(/[^a-z]/g, '')
        .substring(0, 15) + '.de';

      // Create user account for client contact person
      const clientUser = {
        firstName: company.contact.split(' ')[0],
        lastName: company.contact.split(' ')[1],
        email: `${company.contact.toLowerCase().replace(' ', '.')}@${emailDomain}`,
        password: 'client123',
        role: 'client'
      };

      clientUsers.push(clientUser);

      const client = {
        name: company.name,
        nordicClientNumber: `NC-${String(i + 1).padStart(4, '0')}`,
        contactPerson: company.contact,
        email: clientUser.email,
        phoneNumber: `+49${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: {
          street: `Industriestraße ${Math.floor(Math.random() * 50) + 1}`,
          city: company.city,
          postalCode: company.postalCode,
          country: 'Deutschland'
        },
        industry: company.industry,
        contractStartDate: new Date('2025-08-18'), // Started today
        isActive: true,
        preferredPositions: company.positions,
        paymentTerms: Math.random() > 0.5 ? '30 days' : '14 days',
        notes: `Neue Partnerschaft mit ${company.name} seit August 2025`,
        createdBy: randomAdmin._id
      };

      clients.push(client);
    }

    // Insert client users first
    const createdClientUsers = await User.insertMany(clientUsers);
    console.log(`👤 Created ${createdClientUsers.length} client users`);

    // Add userId to clients
    for (let i = 0; i < clients.length; i++) {
      clients[i].contactUserId = createdClientUsers[i]._id;
    }

    const createdClients = await Client.insertMany(clients);
    console.log(`🏢 Created ${createdClients.length} clients`);

    // Statistics
    const industryStats = {};
    const cityStats = {};
    
    createdClients.forEach(client => {
      industryStats[client.industry] = (industryStats[client.industry] || 0) + 1;
      cityStats[client.address.city] = (cityStats[client.address.city] || 0) + 1;
    });

    console.log('\n📊 Client Statistics:');
    console.log('🏭 By Industry:');
    Object.entries(industryStats).forEach(([industry, count]) => {
      console.log(`   ${industry}: ${count} companies`);
    });

    console.log('\n🌍 By City (top 10):');
    Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} companies`);
      });

    console.log('\n💼 Most requested positions:');
    const allPositions = createdClients.flatMap(client => client.preferredPositions);
    const positionStats = {};
    allPositions.forEach(pos => {
      positionStats[pos] = (positionStats[pos] || 0) + 1;
    });
    
    Object.entries(positionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([position, count]) => {
        console.log(`   ${position}: ${count} companies`);
      });

    await mongoose.disconnect();
    console.log('\n✅ Client seeding completed successfully!');
    
    return { createdClients, createdClientUsers };

  } catch (error) {
    console.error('❌ Error seeding clients:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedClients();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedClients, connectDB };
