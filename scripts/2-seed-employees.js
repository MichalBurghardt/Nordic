import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Employee } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding employees...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed employees - run after users are created
const seedEmployees = async () => {
  try {
    console.log('👷 Starting employee seeding...');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('🗑️ Cleared existing employees');

    // Get HR users to assign as employee managers
    const hrUsers = await User.find({ role: 'hr' });
    if (hrUsers.length === 0) {
      throw new Error('No HR users found. Please run 1-seed-users.js first.');
    }

    const employees = [];
    const employeeUsers = [];

    // Employee data from various EU countries
    const employeeData = [
      // Polish employees
      { firstName: 'Jakub', lastName: 'Kowalski', nationality: 'Polish', city: 'Krakow' },
      { firstName: 'Anna', lastName: 'Nowak', nationality: 'Polish', city: 'Warsaw' },
      { firstName: 'Piotr', lastName: 'Wiśniewski', nationality: 'Polish', city: 'Gdansk' },
      { firstName: 'Katarzyna', lastName: 'Wójcik', nationality: 'Polish', city: 'Poznan' },
      { firstName: 'Tomasz', lastName: 'Kowalczyk', nationality: 'Polish', city: 'Wroclaw' },
      { firstName: 'Magdalena', lastName: 'Kamińska', nationality: 'Polish', city: 'Lodz' },
      { firstName: 'Marcin', lastName: 'Lewandowski', nationality: 'Polish', city: 'Krakow' },
      { firstName: 'Agnieszka', lastName: 'Zielińska', nationality: 'Polish', city: 'Warsaw' },
      { firstName: 'Paweł', lastName: 'Szymański', nationality: 'Polish', city: 'Gdansk' },
      { firstName: 'Monika', lastName: 'Dąbrowska', nationality: 'Polish', city: 'Poznan' },
      
      // German employees
      { firstName: 'Hans', lastName: 'Müller', nationality: 'German', city: 'Berlin' },
      { firstName: 'Petra', lastName: 'Schmidt', nationality: 'German', city: 'Munich' },
      { firstName: 'Klaus', lastName: 'Schneider', nationality: 'German', city: 'Hamburg' },
      { firstName: 'Ingrid', lastName: 'Fischer', nationality: 'German', city: 'Cologne' },
      { firstName: 'Wolfgang', lastName: 'Weber', nationality: 'German', city: 'Frankfurt' },
      { firstName: 'Brunhilde', lastName: 'Meyer', nationality: 'German', city: 'Stuttgart' },
      { firstName: 'Dieter', lastName: 'Wagner', nationality: 'German', city: 'Düsseldorf' },
      { firstName: 'Gisela', lastName: 'Becker', nationality: 'German', city: 'Dortmund' },
      { firstName: 'Rolf', lastName: 'Schulz', nationality: 'German', city: 'Essen' },
      { firstName: 'Ursula', lastName: 'Hoffmann', nationality: 'German', city: 'Leipzig' },

      // Czech employees
      { firstName: 'Pavel', lastName: 'Novák', nationality: 'Czech', city: 'Prague' },
      { firstName: 'Jana', lastName: 'Svobodová', nationality: 'Czech', city: 'Brno' },
      { firstName: 'Tomáš', lastName: 'Dvořák', nationality: 'Czech', city: 'Ostrava' },
      { firstName: 'Petra', lastName: 'Černá', nationality: 'Czech', city: 'Plzen' },
      { firstName: 'Martin', lastName: 'Procházka', nationality: 'Czech', city: 'Liberec' },
      { firstName: 'Lenka', lastName: 'Krejčí', nationality: 'Czech', city: 'Hradec Kralove' },
      { firstName: 'Jiří', lastName: 'Bláha', nationality: 'Czech', city: 'Ústí nad Labem' },
      { firstName: 'Věra', lastName: 'Holá', nationality: 'Czech', city: 'Olomouc' },
      { firstName: 'David', lastName: 'Kratochvíl', nationality: 'Czech', city: 'Ceske Budejovice' },
      { firstName: 'Zuzana', lastName: 'Marková', nationality: 'Czech', city: 'Pardubice' },

      // Lithuanian employees
      { firstName: 'Jonas', lastName: 'Petrauskas', nationality: 'Lithuanian', city: 'Vilnius' },
      { firstName: 'Rūta', lastName: 'Kazlauskas', nationality: 'Lithuanian', city: 'Kaunas' },
      { firstName: 'Antanas', lastName: 'Jankauskas', nationality: 'Lithuanian', city: 'Klaipeda' },
      { firstName: 'Dalia', lastName: 'Vasiliauskas', nationality: 'Lithuanian', city: 'Siauliai' },
      { firstName: 'Vytautas', lastName: 'Stankevičius', nationality: 'Lithuanian', city: 'Panevezys' },
      { firstName: 'Audronė', lastName: 'Petrauskas', nationality: 'Lithuanian', city: 'Alytus' },
      { firstName: 'Mindaugas', lastName: 'Balčiūnas', nationality: 'Lithuanian', city: 'Marijampole' },
      { firstName: 'Ingrida', lastName: 'Paulauskas', nationality: 'Lithuanian', city: 'Mazeikiai' },
      { firstName: 'Gediminas', lastName: 'Zukauskas', nationality: 'Lithuanian', city: 'Jonava' },
      { firstName: 'Vida', lastName: 'Rimkus', nationality: 'Lithuanian', city: 'Utena' },

      // Romanian employees
      { firstName: 'Ion', lastName: 'Popescu', nationality: 'Romanian', city: 'Bucharest' },
      { firstName: 'Maria', lastName: 'Ionescu', nationality: 'Romanian', city: 'Cluj-Napoca' },
      { firstName: 'Alexandru', lastName: 'Popa', nationality: 'Romanian', city: 'Timisoara' },
      { firstName: 'Elena', lastName: 'Stoica', nationality: 'Romanian', city: 'Iasi' },
      { firstName: 'Mihai', lastName: 'Stan', nationality: 'Romanian', city: 'Constanta' },
      { firstName: 'Ana', lastName: 'Dumitrescu', nationality: 'Romanian', city: 'Craiova' },
      { firstName: 'Gheorghe', lastName: 'Florea', nationality: 'Romanian', city: 'Galati' },
      { firstName: 'Ioana', lastName: 'Marin', nationality: 'Romanian', city: 'Brasov' },
      { firstName: 'Cristian', lastName: 'Tudor', nationality: 'Romanian', city: 'Ploiesti' },
      { firstName: 'Daniela', lastName: 'Radu', nationality: 'Romanian', city: 'Braila' },

      // Bulgarian employees
      { firstName: 'Ivan', lastName: 'Petrov', nationality: 'Bulgarian', city: 'Sofia' },
      { firstName: 'Mariya', lastName: 'Ivanova', nationality: 'Bulgarian', city: 'Plovdiv' },
      { firstName: 'Georgi', lastName: 'Dimitrov', nationality: 'Bulgarian', city: 'Varna' },
      { firstName: 'Svetlana', lastName: 'Georgieva', nationality: 'Bulgarian', city: 'Burgas' },
      { firstName: 'Dimitar', lastName: 'Nikolov', nationality: 'Bulgarian', city: 'Ruse' },
      { firstName: 'Valentina', lastName: 'Stoyanova', nationality: 'Bulgarian', city: 'Stara Zagora' },
      { firstName: 'Petar', lastName: 'Vasilev', nationality: 'Bulgarian', city: 'Pleven' },
      { firstName: 'Nadezhda', lastName: 'Koleva', nationality: 'Bulgarian', city: 'Sliven' },
      { firstName: 'Stefan', lastName: 'Todorov', nationality: 'Bulgarian', city: 'Dobrich' },
      { firstName: 'Gergana', lastName: 'Atanasova', nationality: 'Bulgarian', city: 'Shumen' }
    ];

    const skills = [
      'Lagerarbeit', 'Staplerfahrer', 'Kommissionierung', 'Verpackung', 
      'Produktion', 'Montage', 'Wartung', 'Transport', 'Inventur', 
      'Reinigung', 'Qualitätskontrolle', 'Maschinenführer', 'Schweißen', 
      'Handwerker'
    ];

    // Create employee users and employees
    for (let i = 0; i < employeeData.length; i++) {
      const emp = employeeData[i];
      // Create user account for employee
      const employeeUser = {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@employee.nordic.de`,
        password: 'employee123',
        role: 'employee'
      };

      employeeUsers.push(employeeUser);

      // Employee skills (2-4 random skills)
      const employeeSkills = [];
      const skillCount = Math.floor(Math.random() * 3) + 2; // 2-4 skills
      const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
      for (let j = 0; j < skillCount; j++) {
        employeeSkills.push(shuffledSkills[j]);
      }

      const employee = {
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        qualifications: [`${emp.nationality} Worker Certificate`],
        skills: employeeSkills,
        experience: `${Math.floor(Math.random() * 10) + 1} years of experience`,
        availability: {
          monday: { available: true, hours: '08:00-16:00' },
          tuesday: { available: true, hours: '08:00-16:00' },
          wednesday: { available: true, hours: '08:00-16:00' },
          thursday: { available: true, hours: '08:00-16:00' },
          friday: { available: true, hours: '08:00-16:00' },
          saturday: { available: Math.random() > 0.7, hours: '08:00-14:00' },
          sunday: { available: false }
        },
        hourlyRate: Math.floor(Math.random() * 7) + 12, // €12-18
        bankDetails: {
          accountNumber: `DE${Math.floor(Math.random() * 900000000000000000) + 100000000000000000}`,
          bankCode: `${Math.floor(Math.random() * 90000000) + 10000000}`,
          bankName: `${emp.nationality} Bank AG`
        },
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: Math.random() > 0.5 ? 'Ehepartner' : 'Eltern',
          phoneNumber: `+49${Math.floor(Math.random() * 900000000) + 100000000}`
        },
        documents: [
          {
            name: 'Passport',
            type: 'ID',
            url: `/docs/passport_${i + 1}.pdf`
          },
          {
            name: 'Work Permit',
            type: 'PERMIT',
            url: `/docs/permit_${i + 1}.pdf`
          }
        ],
        status: 'available'
      };

      employees.push(employee);
    }

    // Insert employee users first
    const createdEmployeeUsers = await User.insertMany(employeeUsers);
    console.log(`👤 Created ${createdEmployeeUsers.length} employee users`);

    // Add userId to employees
    for (let i = 0; i < employees.length; i++) {
      employees[i].userId = createdEmployeeUsers[i]._id;
    }

    const createdEmployees = await Employee.insertMany(employees);
    console.log(`👷 Created ${createdEmployees.length} employees`);

    // Statistics
    const nationalityStats = {};
    const skillStats = {};
    
    createdEmployees.forEach(employee => {
      nationalityStats[employee.nationality] = (nationalityStats[employee.nationality] || 0) + 1;
      
      employee.skills.forEach(skill => {
        skillStats[skill] = (skillStats[skill] || 0) + 1;
      });
    });

    console.log('\n📊 Employee Statistics:');
    console.log('🌍 By Nationality:');
    Object.entries(nationalityStats).forEach(([nationality, count]) => {
      console.log(`   ${nationality}: ${count} employees`);
    });

    console.log('\n🔧 Most Common Skills:');
    Object.entries(skillStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([skill, count]) => {
        console.log(`   ${skill}: ${count} employees`);
      });

    const avgHourlyRate = createdEmployees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / createdEmployees.length;
    console.log(`\n💰 Average hourly rate: €${avgHourlyRate.toFixed(2)}/h`);

    await mongoose.disconnect();
    console.log('\n✅ Employee seeding completed successfully!');
    
    return { createdEmployees, createdEmployeeUsers };

  } catch (error) {
    console.error('❌ Error seeding employees:', error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedEmployees();
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedEmployees, connectDB };
