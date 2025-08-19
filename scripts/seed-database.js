import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Client, Employee, Assignment, Audit, Message, Schedule } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Employee.deleteMany({});
    await Assignment.deleteMany({});
    await Schedule.deleteMany({});
    await Audit.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin users
    await User.create({
      firstName: 'Admin',
      lastName: 'Nordic',
      email: 'admin@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });

    await User.create({
      firstName: 'Thomas',
      lastName: 'Müller',
      email: 'thomas.mueller@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });

    await User.create({
      firstName: 'Sandra',
      lastName: 'Weber',
      email: 'sandra.weber@nordic-zeitarbeit.de',
      password: 'admin123',
      role: 'admin'
    });
    console.log('👤 Created 3 admin users');

    // Create HR users
    await User.create({
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@nordic-zeitarbeit.de',
      password: 'hr123',
      role: 'hr'
    });

    await User.create({
      firstName: 'Michael',
      lastName: 'Fischer',
      email: 'michael.fischer@nordic-zeitarbeit.de',
      password: 'hr123',
      role: 'hr'
    });

    await User.create({
      firstName: 'Julia',
      lastName: 'Wagner',
      email: 'julia.wagner@nordic-zeitarbeit.de',
      password: 'hr123',
      role: 'hr'
    });

    await User.create({
      firstName: 'Daniel',
      lastName: 'Becker',
      email: 'daniel.becker@nordic-zeitarbeit.de',
      password: 'hr123',
      role: 'hr'
    });

    await User.create({
      firstName: 'Lisa',
      lastName: 'Schulz',
      email: 'lisa.schulz@nordic-zeitarbeit.de',
      password: 'hr123',
      role: 'hr'
    });
    console.log('👤 Created 5 HR users');

    // German cities for clients
    const germanCities = [
      { city: 'Berlin', state: 'Berlin' },
      { city: 'Hamburg', state: 'Hamburg' },
      { city: 'München', state: 'Bayern' },
      { city: 'Köln', state: 'Nordrhein-Westfalen' },
      { city: 'Frankfurt am Main', state: 'Hessen' },
      { city: 'Stuttgart', state: 'Baden-Württemberg' },
      { city: 'Düsseldorf', state: 'Nordrhein-Westfalen' },
      { city: 'Dortmund', state: 'Nordrhein-Westfalen' },
      { city: 'Essen', state: 'Nordrhein-Westfalen' },
      { city: 'Leipzig', state: 'Sachsen' },
      { city: 'Bremen', state: 'Bremen' },
      { city: 'Dresden', state: 'Sachsen' },
      { city: 'Hannover', state: 'Niedersachsen' },
      { city: 'Nürnberg', state: 'Bayern' },
      { city: 'Duisburg', state: 'Nordrhein-Westfalen' },
      { city: 'Bochum', state: 'Nordrhein-Westfalen' },
      { city: 'Wuppertal', state: 'Nordrhein-Westfalen' },
      { city: 'Bielefeld', state: 'Nordrhein-Westfalen' },
      { city: 'Bonn', state: 'Nordrhein-Westfalen' },
      { city: 'Münster', state: 'Nordrhein-Westfalen' },
      { city: 'Karlsruhe', state: 'Baden-Württemberg' },
      { city: 'Mannheim', state: 'Baden-Württemberg' },
      { city: 'Augsburg', state: 'Bayern' },
      { city: 'Wiesbaden', state: 'Hessen' },
      { city: 'Gelsenkirchen', state: 'Nordrhein-Westfalen' },
      { city: 'Mönchengladbach', state: 'Nordrhein-Westfalen' },
      { city: 'Braunschweig', state: 'Niedersachsen' },
      { city: 'Chemnitz', state: 'Sachsen' },
      { city: 'Kiel', state: 'Schleswig-Holstein' },
      { city: 'Aachen', state: 'Nordrhein-Westfalen' }
    ];

    // Logistics and production company names
    const logisticsCompanies = [
      'Deutsche Logistik', 'TransEuro', 'CargoMax', 'LogiFlow', 'SpeedTrans',
      'EuroFreight', 'FastCargo', 'LogiPartner', 'TransConnect', 'CargoLink'
    ];

    const productionCompanies = [
      'ProdTech', 'ManufacturingPro', 'IndustrieWerk', 'ProductionMax', 'TechProd',
      'AutoParts', 'MetallWerk', 'ChemieIndustrie', 'ElektroTech', 'MaschinenBau'
    ];

    // Create 30 clients
    const clients = [];
    for (let i = 0; i < 30; i++) {
      const location = germanCities[i];
      const isLogistics = i < 15;
      const companyNames = isLogistics ? logisticsCompanies : productionCompanies;
      const companyName = companyNames[i % 10] + ' ' + location.city + ' GmbH';
      
      const client = {
        name: companyName,
        contactPerson: generateGermanName(),
        email: `kontakt@${companyName.toLowerCase().replace(/\s+/g, '-').replace('ü', 'ue').replace('ä', 'ae').replace('ö', 'oe')}.de`,
        password: 'client123',
        phoneNumber: generateGermanPhone(),
        nordicClientNumber: `NC-${String(i + 1).padStart(4, '0')}`, // NC-0001, NC-0002, etc.
        clientReferenceNumber: `CR-${Math.floor(Math.random() * 90000) + 10000}`, // CR-12345
        address: {
          street: `${generateStreetName()} ${Math.floor(Math.random() * 200) + 1}`,
          city: location.city,
          postalCode: generatePostalCode(location.city),
          country: 'Germany'
        },
        industry: isLogistics ? 'Logistik' : 'Produktion',
        hourlyRateMultiplier: Math.round((0.8 + Math.random() * 0.4) * 100) / 100, // 0.8 - 1.2
        taxNumber: `DE${Math.floor(Math.random() * 900000000) + 100000000}`,
        description: isLogistics ? 'Spezialisiert auf europäische Transporte' : 'Moderne Produktionsanlagen',
        isActive: Math.random() > 0.1
      };
      
      clients.push(client);
    }

    const createdClients = await Client.insertMany(clients);
    console.log(`🏢 Created ${createdClients.length} clients`);

    // Create client users (firms as users with role 'client')
    const clientUsers = [];
    for (let i = 0; i < createdClients.length; i++) {
      const client = createdClients[i];
      const clientUser = {
        firstName: client.contactPerson.split(' ')[0],
        lastName: client.contactPerson.split(' ')[1] || 'Manager',
        email: client.email,
        password: 'client123',
        role: 'client',
        companyName: client.name
      };
      clientUsers.push(clientUser);
    }

    const createdClientUsers = await User.insertMany(clientUsers);
    console.log(`👤 Created ${createdClientUsers.length} client users`);

    // Countries and typical names
    const countries = [
      {
        name: 'Polen',
        firstNames: ['Piotr', 'Anna', 'Krzysztof', 'Magdalena', 'Tomasz', 'Katarzyna', 'Michał', 'Agnieszka', 'Marcin', 'Małgorzata', 'Łukasz', 'Joanna'],
        lastNames: ['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak']
      },
      {
        name: 'Deutschland',
        firstNames: ['Hans', 'Anna', 'Klaus', 'Petra', 'Wolfgang', 'Sabine', 'Jürgen', 'Monika', 'Dieter', 'Andrea', 'Thomas', 'Susanne'],
        lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann']
      },
      {
        name: 'Tschechien',
        firstNames: ['Jan', 'Marie', 'Petr', 'Jana', 'Pavel', 'Eva', 'Tomáš', 'Anna', 'Jiří', 'Hana', 'Josef', 'Věra'],
        lastNames: ['Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Krejčí', 'Horáček', 'Němec', 'Pokorný']
      },
      {
        name: 'Litauen',
        firstNames: ['Jonas', 'Rūta', 'Petras', 'Gintė', 'Andrius', 'Eglė', 'Vytautas', 'Inga', 'Mindaugas', 'Neringa', 'Darius', 'Lina'],
        lastNames: ['Petrauskas', 'Kazlauskas', 'Jankauskas', 'Stankevičius', 'Vasiliauskas', 'Žukauskas', 'Butkus', 'Paulauskas', 'Urbonas', 'Pocius']
      }
    ];

    // Skills for zeitarbeit workers
    const skills = [
      'Lagerarbeit', 'Kommissionierung', 'Staplerfahrer', 'Verpackung', 'Qualitätskontrolle',
      'Montage', 'Produktion', 'Maschinenführer', 'Schweißen', 'Reinigung',
      'Transport', 'Logistik', 'Inventur', 'Wartung', 'Handwerker'
    ];

    // Create 60 employees
    const employees = [];
    const users = [];

    for (let i = 0; i < 60; i++) {
      const country = countries[i % 4];
      const firstName = country.firstNames[Math.floor(Math.random() * country.firstNames.length)];
      const lastName = country.lastNames[Math.floor(Math.random() * country.lastNames.length)];
      
      // Create user first
      const user = {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        password: 'worker123',
        role: 'employee'
      };
      
      users.push(user);
    }

    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} employee users`);

    // Now create employees linked to users
    for (let i = 0; i < 60; i++) {
      const country = countries[i % 4];
      const hourlyRate = Math.floor(Math.random() * 7) + 12; // 12-18 Euro
      const weeklyHours = Math.floor(Math.random() * 21) + 20; // 20-40 hours
      const employeeSkills = [];
      
      // Add 2-4 random skills
      const numberOfSkills = Math.floor(Math.random() * 3) + 2;
      const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numberOfSkills; j++) {
        employeeSkills.push(shuffledSkills[j]);
      }

      const employee = {
        userId: createdUsers[i]._id,
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        hourlyRate,
        skills: employeeSkills,
        availability: {
          monday: Math.random() > 0.2,
          tuesday: Math.random() > 0.2,
          wednesday: Math.random() > 0.2,
          thursday: Math.random() > 0.2,
          friday: Math.random() > 0.2,
          saturday: Math.random() > 0.7,
          sunday: Math.random() > 0.8
        },
        bankAccount: {
          iban: generateIBAN(country.name),
          bankName: generateBankName(country.name)
        },
        taxId: generateTaxId(country.name),
        socialSecurityNumber: generateSSN(country.name),
        emergencyContact: {
          name: generateName(country),
          phone: generatePhone(country.name),
          relationship: Math.random() > 0.5 ? 'Partner' : 'Familie'
        },
        workPermit: {
          hasPermit: true,
          permitNumber: `WP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          expiryDate: new Date(2025, 11, 31), // End of 2025
          country: country.name
        },
        contractType: Math.random() > 0.3 ? 'temporary' : 'permanent',
        vacationDays: 24,
        usedVacationDays: Math.floor(Math.random() * 12), // 0-11 days used
        weeklyHours,
        status: Math.random() > 0.05 ? 'active' : 'inactive'
      };

      employees.push(employee);
    }

    const createdEmployees = await Employee.insertMany(employees);
    console.log(`👷 Created ${createdEmployees.length} employees`);

    // Create some sample assignments
    const assignments = [];
    for (let i = 0; i < 25; i++) {
      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      const employee = createdEmployees[Math.floor(Math.random() * createdEmployees.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Start within next 30 days
      startDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 90) + 7); // 1 week to 3 months duration
      endDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999

      const positions = ['Lagerarbeiter', 'Kommissionierer', 'Produktionshelfer', 'Staplerfahrer', 'Qualitätsprüfer', 'Montagehelfer'];
      const selectedPosition = positions[Math.floor(Math.random() * positions.length)];
      
      const assignment = {
        clientId: client._id,
        employeeId: employee._id,
        position: selectedPosition,
        startDate,
        endDate,
        workLocation: client.address.city, // City from client address
        hourlyRate: employee.hourlyRate,
        maxHours: employee.weeklyHours,
        description: `${selectedPosition} bei ${client.name}`,
        requirements: employee.skills.slice(0, 2), // First 2 skills as requirements
        status: Math.random() > 0.3 ? 'active' : (Math.random() > 0.5 ? 'completed' : 'pending')
      };

      assignments.push(assignment);
    }

    const createdAssignments = await Assignment.insertMany(assignments);
    console.log(`📋 Created ${createdAssignments.length} assignments`);

    // Create schedule entries for current and upcoming weeks
    const schedules = [];
    const today = new Date();
    const adminUser = await User.findOne({ role: 'admin' });

    // Create schedules for the next 8 weeks
    for (let week = 0; week < 8; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week * 7) - today.getDay() + 1); // Monday of the week
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Friday
      weekEnd.setHours(23, 59, 59, 999);

      // Create 3-5 random schedules per week
      const schedulesThisWeek = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < schedulesThisWeek; i++) {
        const randomEmployee = createdEmployees[Math.floor(Math.random() * createdEmployees.length)];
        const randomClient = createdClients[Math.floor(Math.random() * createdClients.length)];
        const randomAssignment = createdAssignments[Math.floor(Math.random() * createdAssignments.length)];

        // Random start date within the week (Monday to Friday)
        const startDate = new Date(weekStart);
        startDate.setDate(weekStart.getDate() + Math.floor(Math.random() * 5)); // 0-4 days (Mon-Fri)
        startDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000

        // Random duration 1-5 days
        const duration = Math.floor(Math.random() * 5) + 1;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration - 1);
        endDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999

        // Ensure endDate doesn't exceed Friday
        const fridayEnd = new Date(weekEnd);
        fridayEnd.setHours(23, 59, 59, 999);
        if (endDate > fridayEnd) {
          endDate.setTime(fridayEnd.getTime());
        }

        const startTimes = ['07:00', '08:00', '09:00', '10:00'];
        const endTimes = ['15:00', '16:00', '17:00', '18:00'];
        
        const startTime = startTimes[Math.floor(Math.random() * startTimes.length)];
        const endTime = endTimes[Math.floor(Math.random() * endTimes.length)];
        
        const dailyHours = parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0]);
        const weeklyHours = dailyHours * 5; // Assume 5 days per week

        const schedule = {
          employeeId: randomEmployee._id,
          clientId: randomClient._id,
          assignmentId: randomAssignment._id,
          startDate,
          endDate,
          startTime,
          endTime,
          weeklyHours,
          status: week === 0 ? 'active' : (week < 2 ? 'confirmed' : 'planned'),
          notes: `Work assignment for ${randomEmployee.firstName} ${randomEmployee.lastName} at ${randomClient.name}`,
          createdBy: adminUser._id
        };

        schedules.push(schedule);
      }
    }

    const createdSchedules = await Schedule.insertMany(schedules);
    console.log(`📅 Created ${createdSchedules.length} schedule entries`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin user: admin@nordic-zeitarbeit.de (password: admin123)`);
    console.log(`- ${createdClients.length} clients from German logistics and production companies`);
    console.log(`- ${createdEmployees.length} employees from Poland, Germany, Czech Republic, and Lithuania`);
    console.log(`- ${createdAssignments.length} sample assignments`);
    console.log(`- ${createdSchedules.length} schedule entries for the next 8 weeks`);
    console.log(`- Hourly rates: €12-18`);
    console.log(`- Weekly hours: 20-40 hours`);
    console.log(`- Vacation days: 24 per year`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Helper functions
function generateGermanName() {
  const firstNames = ['Hans', 'Anna', 'Klaus', 'Petra', 'Wolfgang', 'Sabine', 'Jürgen', 'Monika', 'Dieter', 'Andrea'];
  const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateName(country) {
  const firstName = country.firstNames[Math.floor(Math.random() * country.firstNames.length)];
  const lastName = country.lastNames[Math.floor(Math.random() * country.lastNames.length)];
  return `${firstName} ${lastName}`;
}

function generateGermanPhone() {
  const areaCodes = ['030', '040', '089', '0221', '069', '0711', '0211', '0231'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return `+49 ${areaCode} ${number}`;
}

function generatePhone(country) {
  switch(country) {
    case 'Polen': return `+48 ${Math.floor(Math.random() * 900000000) + 100000000}`;
    case 'Deutschland': return generateGermanPhone();
    case 'Tschechien': return `+420 ${Math.floor(Math.random() * 900000000) + 100000000}`;
    case 'Litauen': return `+370 ${Math.floor(Math.random() * 90000000) + 10000000}`;
    default: return generateGermanPhone();
  }
}

function generateStreetName() {
  const streets = ['Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Poststraße', 'Schulstraße', 'Gartenstraße', 'Marktstraße', 'Industriestraße'];
  return streets[Math.floor(Math.random() * streets.length)];
}

function generatePostalCode(city) {
  const postalCodes = {
    'Berlin': '10115', 'Hamburg': '20095', 'München': '80331', 'Köln': '50667',
    'Frankfurt am Main': '60311', 'Stuttgart': '70173', 'Düsseldorf': '40213'
  };
  return postalCodes[city] || `${Math.floor(Math.random() * 90000) + 10000}`;
}

function generateIBAN(country) {
  switch(country) {
    case 'Polen': return `PL${Math.floor(Math.random() * 900000000000000000000000) + 100000000000000000000000}`;
    case 'Deutschland': return `DE${Math.floor(Math.random() * 90000000000000000000) + 10000000000000000000}`;
    case 'Tschechien': return `CZ${Math.floor(Math.random() * 90000000000000000000) + 10000000000000000000}`;
    case 'Litauen': return `LT${Math.floor(Math.random() * 90000000000000000000) + 10000000000000000000}`;
    default: return `DE${Math.floor(Math.random() * 90000000000000000000) + 10000000000000000000}`;
  }
}

function generateBankName(country) {
  const banks = {
    'Polen': ['PKO Bank Polski', 'Bank Pekao', 'mBank', 'ING Bank Śląski'],
    'Deutschland': ['Deutsche Bank', 'Commerzbank', 'Sparkasse', 'Volksbank'],
    'Tschechien': ['Česká spořitelna', 'Komerční banka', 'ČSOB', 'UniCredit Bank'],
    'Litauen': ['SEB bankas', 'Swedbank', 'Luminor Bank', 'Šiaulių bankas']
  };
  const countryBanks = banks[country] || banks['Deutschland'];
  return countryBanks[Math.floor(Math.random() * countryBanks.length)];
}

function generateTaxId(country) {
  switch(country) {
    case 'Polen': return `PL${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    case 'Deutschland': return `DE${Math.floor(Math.random() * 900000000) + 100000000}`;
    case 'Tschechien': return `CZ${Math.floor(Math.random() * 900000000) + 100000000}`;
    case 'Litauen': return `LT${Math.floor(Math.random() * 900000000) + 100000000}`;
    default: return `DE${Math.floor(Math.random() * 900000000) + 100000000}`;
  }
}

function generateSSN(country) {
  switch(country) {
    case 'Polen': return `${Math.floor(Math.random() * 90000000000) + 10000000000}`;
    case 'Deutschland': return `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`;
    case 'Tschechien': return `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    case 'Litauen': return `${Math.floor(Math.random() * 900000000000) + 100000000000}`;
    default: return `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`;
  }
}

// Run the seeder
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();
