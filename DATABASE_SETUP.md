# Database Setup Guide

This project now uses PostgreSQL with Prisma ORM instead of SQLite. You can use either a local PostgreSQL database or Neon DB (cloud PostgreSQL).

## 🚀 Quick Start

### Option 1: Local PostgreSQL (Development)

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**
   ```bash
   # Windows (if installed as service)
   net start postgresql
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create database**
   ```sql
   CREATE DATABASE bill_generator;
   CREATE USER postgres WITH PASSWORD 'admin';
   GRANT ALL PRIVILEGES ON DATABASE bill_generator TO postgres;
   ```

4. **Switch to local database**
   ```bash
   node scripts/switch-db.js local
   ```

### Option 2: Neon DB (Production/Cloud)

1. **Switch to Neon DB**
   ```bash
   node scripts/switch-db.js neon
   ```

## 🔧 Database Management

### Switch Between Databases
```bash
# Switch to local PostgreSQL
node scripts/switch-db.js local

# Switch to Neon DB
node scripts/switch-db.js neon
```

### Run Migrations
```bash
# Push schema changes to database
npx prisma db push

# Create and run migrations
npx prisma migrate dev --name migration_name
```

### View Database
```bash
# Open Prisma Studio (web interface)
npx prisma studio
```

### Test Connection
```bash
# Test database connection
node scripts/setup-database.js
```

## 📊 Database Migration

The application has been migrated from SQLite to PostgreSQL with Prisma ORM. All existing data has been migrated and the old SQLite database is no longer used.

## 🛠️ Environment Variables

The `.env` file contains database configuration:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"

# Neon DB (commented out)
# DATABASE_URL="postgresql://neondb_owner:npg_O9LBIrRMya4h@ep-curly-breeze-a1a82i4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## 🏗️ Database Schema

The database includes the following tables:

- **bills** - Main bill records
- **bill_items** - Items within bills
- **bill_distributions** - Distribution data for 60/30/10 split
- **gst_bills** - GST bill records

## 🚨 Troubleshooting

### Connection Issues
1. Check if PostgreSQL is running
2. Verify database credentials
3. Ensure database exists
4. Check firewall settings

### Migration Issues
1. Ensure Prisma client is generated: `npx prisma generate`
2. Check database permissions
3. Verify schema matches Prisma models

### Performance Issues
1. Use connection pooling for production
2. Consider using Neon DB for better performance
3. Monitor database queries in Prisma Studio

## 📝 Notes

- The application automatically creates the database schema on first run
- All existing data has been migrated to PostgreSQL
- The application now uses PostgreSQL with Prisma ORM exclusively
- Prisma provides type-safe database access
- Both local and cloud databases use the same schema
