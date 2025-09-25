const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Get database URL from command line argument or use default
const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Database URL is required!');
  console.log('Usage: node scripts/manage-users.js <DATABASE_URL>');
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createUser() {
  try {
    console.log('\n=== Create New User ===\n');
    
    const email = await askQuestion('Enter email: ');
    const password = await askQuestion('Enter password: ');
    const name = await askQuestion('Enter name (optional): ');

    if (!email || !password) {
      console.log('❌ Email and password are required!');
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User with this email already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    });

    console.log('✅ User created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name || 'Not provided'}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Created: ${user.createdAt}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
}

async function listUsers() {
  try {
    console.log('\n=== All Users ===\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            bills: true,
            gstBills: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('No users found.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || 'Not provided'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Bills: ${user._count.bills}, GST Bills: ${user._count.gstBills}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

async function deleteUser() {
  try {
    console.log('\n=== Delete User ===\n');
    
    const email = await askQuestion('Enter email of user to delete: ');

    if (!email) {
      console.log('❌ Email is required!');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            bills: true,
            gstBills: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log(`\nFound user: ${user.email}`);
    console.log(`Name: ${user.name || 'Not provided'}`);
    console.log(`Bills: ${user._count.bills}, GST Bills: ${user._count.gstBills}`);

    const confirm = await askQuestion('\nAre you sure you want to delete this user? (yes/no): ');

    if (confirm.toLowerCase() === 'yes') {
      await prisma.user.delete({
        where: { email }
      });
      console.log('✅ User deleted successfully!');
    } else {
      console.log('❌ Deletion cancelled.');
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  }
}

async function updatePassword() {
  try {
    console.log('\n=== Update Password ===\n');
    
    const email = await askQuestion('Enter email: ');
    const newPassword = await askQuestion('Enter new password: ');

    if (!email || !newPassword) {
      console.log('❌ Email and password are required!');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('✅ Password updated successfully!');

  } catch (error) {
    console.error('❌ Error updating password:', error.message);
  }
}

async function showMenu() {
  console.log('\n=== User Management System ===');
  console.log('1. Create new user');
  console.log('2. List all users');
  console.log('3. Delete user');
  console.log('4. Update password');
  console.log('5. Exit');
  
  const choice = await askQuestion('\nSelect an option (1-5): ');
  
  switch (choice) {
    case '1':
      await createUser();
      break;
    case '2':
      await listUsers();
      break;
    case '3':
      await deleteUser();
      break;
    case '4':
      await updatePassword();
      break;
    case '5':
      console.log('👋 Goodbye!');
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
      break;
    default:
      console.log('❌ Invalid option. Please select 1-5.');
  }
  
  // Show menu again
  await showMenu();
}

async function main() {
  try {
    console.log('🔗 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    await showMenu();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

main();
