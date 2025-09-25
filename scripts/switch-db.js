const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

// Database configurations
const configs = {
  local: {
    DATABASE_URL: 'postgresql://postgres:admin@localhost:5432/bill_generator?schema=public',
    description: 'Local PostgreSQL'
  },
  neon: {
    DATABASE_URL: 'postgresql://neondb_owner:npg_O9LBIrRMya4h@ep-curly-breeze-a1a82i4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    description: 'Neon DB (Production)'
  }
};

function switchDatabase(target) {
  if (!configs[target]) {
    console.error(`❌ Unknown database target: ${target}`);
    console.log('Available targets: local, neon');
    process.exit(1);
  }

  try {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update DATABASE_URL
    const newUrl = configs[target].DATABASE_URL;
    envContent = envContent.replace(
      /DATABASE_URL="[^"]*"/,
      `DATABASE_URL="${newUrl}"`
    );
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Switched to ${configs[target].description}`);
    console.log(`📊 Database URL: ${newUrl}`);
    
    // Regenerate Prisma client
    console.log('🔄 Regenerating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🎉 Database switch completed!');
    
  } catch (error) {
    console.error('❌ Error switching database:', error.message);
    process.exit(1);
  }
}

// Get target from command line arguments
const target = process.argv[2];

if (!target) {
  console.log('Usage: node scripts/switch-db.js <target>');
  console.log('Available targets:');
  console.log('  local - Switch to local PostgreSQL');
  console.log('  neon  - Switch to Neon DB');
  process.exit(1);
}

switchDatabase(target);
