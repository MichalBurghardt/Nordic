#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require('os');

console.log('🧹 Cleaning ports before starting Next.js...');

const killPort = (port) => {
  return new Promise((resolve) => {
    if (os.platform() === 'win32') {
      // Windows command
      exec(`npx kill-port ${port}`, (error) => {
        if (error) {
          console.log(`Port ${port} was already free`);
        } else {
          console.log(`✅ Port ${port} cleaned`);
        }
        resolve();
      });
    } else {
      // Unix/Linux/Mac command
      exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
        if (error) {
          console.log(`Port ${port} was already free`);
        } else {
          console.log(`✅ Port ${port} cleaned`);
        }
        resolve();
      });
    }
  });
};

async function cleanPorts() {
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    await killPort(port);
  }
  
  console.log('🚀 All ports cleaned! Starting Next.js...\n');
}

if (require.main === module) {
  cleanPorts();
}

module.exports = { cleanPorts };
