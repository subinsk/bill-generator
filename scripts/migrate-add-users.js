const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Get database URL from command line argument or use default
const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Database URL is required!');
  console.log('Usage: node scripts/migrate-add-users.js <DATABASE_URL>');
  console.log('Or set DATABASE_URL environment variable');
  process.exit(1);
}

console.log('🔗 Using database URL:', databaseUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function migrateAddUsers() {
  try {
    console.log('Starting user migration...');

    // Create a default user
    const defaultUserEmail = 'subinsk284@gmail.com';
    const defaultUserPassword = 'sookshma';
    
    // Check if user already exists
    let defaultUser = await prisma.user.findUnique({
      where: { email: defaultUserEmail }
    });

    if (!defaultUser) {
      // Hash password
      const hashedPassword = await bcrypt.hash(defaultUserPassword, 12);
      
      // Create default user
      defaultUser = await prisma.user.create({
        data: {
          email: defaultUserEmail,
          password: hashedPassword,
          name: 'Default User'
        }
      });
      
      console.log('✅ Created default user:', defaultUserEmail);
    } else {
      console.log('✅ Default user already exists:', defaultUserEmail);
    }

    // Since userId is required in the schema, all bills should already have users
    // Let's just show the current state
    const totalBills = await prisma.bill.count();
    const totalGstBills = await prisma.gstBill.count();
    
    console.log(`📊 Database contains:`);
    console.log(`   - ${totalBills} total distribution bills`);
    console.log(`   - ${totalGstBills} total GST bills`);

    // Show summary of user's bills
    const userBillsCount = await prisma.bill.count({
      where: { userId: defaultUser.id }
    });
    const userGstBillsCount = await prisma.gstBill.count({
      where: { userId: defaultUser.id }
    });
    
    console.log(`📊 User ${defaultUserEmail} now has:`);
    console.log(`   - ${userBillsCount} distribution bills`);
    console.log(`   - ${userGstBillsCount} GST bills`);

    console.log('🎉 User migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateAddUsers()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
