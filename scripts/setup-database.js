const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const billCount = await prisma.bill.count();
    console.log(`📊 Current bills in database: ${billCount}`);
    
    const gstBillCount = await prisma.gstBill.count();
    console.log(`📊 Current GST bills in database: ${gstBillCount}`);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .then(() => {
    console.log('Setup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup script failed:', error);
    process.exit(1);
  });
