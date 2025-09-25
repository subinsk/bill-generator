const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Get database URL from command line argument or use default
const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Database URL is required!');
  console.log('Usage: node scripts/add-user.js <DATABASE_URL>');
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

async function addUser() {
  try {
    console.log('🔗 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');

    // Get user details from command line arguments
    const email = process.argv[3];
    const password = process.argv[4];
    const name = process.argv[5] || 'User';

    if (!email || !password) {
      console.error('❌ Email and password are required!');
      console.log('Usage: node scripts/add-user.js <DATABASE_URL> <EMAIL> <PASSWORD> [NAME]');
      console.log('Example: node scripts/add-user.js "postgresql://..." "user@example.com" "password123" "John Doe"');
      process.exit(1);
    }

    console.log(`\n📝 Adding user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User with this email already exists!');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Created: ${existingUser.createdAt.toLocaleDateString()}`);
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    console.log('✅ User created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Created: ${user.createdAt}`);

    // Show user count
    const userCount = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addUser();
