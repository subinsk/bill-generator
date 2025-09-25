const { PrismaClient } = require('@prisma/client');

console.log('Testing Prisma connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
