require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
console.log('Full URL:', process.env.DATABASE_URL);

// Test database connection with Prisma v5
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    // Test database info
    const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_user, current_schema()`;
    console.log('✅ Database info:', dbInfo);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();