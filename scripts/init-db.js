// Initialize SQLite database
const { getDatabase } = require('../src/lib/database.ts');

try {
  console.log('Initializing database...');
  const db = getDatabase();
  console.log('Database initialized successfully!');
  console.log('Database file: bills.db');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
