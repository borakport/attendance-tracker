require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('Environment loaded');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

console.log('Creating Prisma client...');
const prisma = new PrismaClient();

console.log('Testing connection...');
prisma.$connect()
  .then(() => {
    console.log('Connection successful!');
    return prisma.$disconnect();
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
  });
