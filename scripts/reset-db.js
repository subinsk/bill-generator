const fs = require('fs');
const path = require('path');

// Path to the database file
const dbPath = path.join(process.cwd(), 'bills.db');

try {
  // Check if database exists
  if (fs.existsSync(dbPath)) {
    // Delete the existing database
    fs.unlinkSync(dbPath);
    console.log('✅ Existing database deleted successfully');
  } else {
    console.log('ℹ️  No existing database found');
  }
  
  // Import and initialize the database
  const { initDatabase } = require('../src/lib/database.ts');
  initDatabase();
  
  console.log('✅ Database reinitialized with updated schema');
  console.log('🔄 Please restart your development server');
  
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}
