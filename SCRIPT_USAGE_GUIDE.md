# Script Usage Guide

This guide explains how to use the database management scripts with different database URLs.

## 🔧 **Scripts Overview**

### 1. **User Migration Script** (`scripts/migrate-add-users.js`)
- Creates the default user if it doesn't exist
- Shows database statistics
- Works with any PostgreSQL database

### 2. **User Management Script** (`scripts/manage-users.js`)
- Interactive menu for user CRUD operations
- Create, list, delete, and update users
- Works with any PostgreSQL database

### 3. **Add User Script** (`scripts/add-user.js`)
- Quick way to add a single user
- Command-line interface
- Works with any PostgreSQL database

### 4. **Test Auth Script** (`scripts/test-auth.js`)
- Tests authentication system functionality
- Verifies user setup and password hashing
- Works with any PostgreSQL database

## 🚀 **Usage Examples**

### **Local PostgreSQL Database**
```bash
# User migration
node scripts/migrate-add-users.js "postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"

# Add a user
node scripts/add-user.js "postgresql://postgres:admin@localhost:5432/bill_generator?schema=public" "user@example.com" "password123" "User Name"

# Interactive user management
node scripts/manage-users.js "postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"

# Test authentication
node scripts/test-auth.js "postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"
```

### **Neon DB (Production)**
```bash
# User migration
node scripts/migrate-add-users.js "postgresql://neondb_owner:npg_O9LBIrRMya4h@ep-curly-breeze-a1a82i4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Add a user
node scripts/add-user.js "postgresql://neondb_owner:npg_O9LBIrRMya4h@ep-curly-breeze-a1a82i4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" "admin@company.com" "securepassword" "Admin User"

# Interactive user management
node scripts/manage-users.js "postgresql://neondb_owner:npg_O9LBIrRMya4h@ep-curly-breeze-a1a82i4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Test authentication
node scripts/test-auth.js "postgresql://neondb_owner:npg_O9LBIrRMya4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### **Using Environment Variables**
```bash
# Set environment variable
export DATABASE_URL="postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"

# Run scripts without URL parameter
node scripts/migrate-add-users.js
node scripts/add-user.js "user@example.com" "password123" "User Name"
node scripts/manage-users.js
node scripts/test-auth.js
```

## 📋 **Script Details**

### **1. User Migration Script**
```bash
node scripts/migrate-add-users.js <DATABASE_URL>
```

**What it does:**
- Creates default user `subinsk284@gmail.com` with password `sookshma`
- Shows database statistics
- Displays user's bill counts

**Output:**
```
🔗 Using database URL: postgresql://***:***@localhost:5432/bill_generator?schema=public
Starting user migration...
✅ Default user already exists: subinsk284@gmail.com
📊 Database contains:
   - 2 total distribution bills
   - 2 total GST bills
📊 User subinsk284@gmail.com now has:
   - 2 distribution bills
   - 2 GST bills
🎉 User migration completed successfully!
```

### **2. Add User Script**
```bash
node scripts/add-user.js <DATABASE_URL> <EMAIL> <PASSWORD> [NAME]
```

**Parameters:**
- `DATABASE_URL`: PostgreSQL connection string
- `EMAIL`: User's email address
- `PASSWORD`: User's password (will be hashed)
- `NAME`: Optional user's display name

**Example:**
```bash
node scripts/add-user.js "postgresql://..." "admin@company.com" "securepass" "Admin User"
```

**Output:**
```
🔗 Using database URL: postgresql://***:***@localhost:5432/bill_generator?schema=public
🔗 Connecting to database...
✅ Connected to database successfully!

📝 Adding user:
   Email: admin@company.com
   Name: Admin User
🔐 Hashing password...
👤 Creating user...
✅ User created successfully!
📧 Email: admin@company.com
👤 Name: Admin User
🆔 ID: 12345678-1234-1234-1234-123456789abc
📅 Created: Thu Sep 25 2025 22:57:14 GMT+0530 (India Standard Time)

📊 Total users in database: 3
```

### **3. User Management Script**
```bash
node scripts/manage-users.js <DATABASE_URL>
```

**Interactive Menu:**
```
=== User Management System ===
1. Create new user
2. List all users
3. Delete user
4. Update password
5. Exit

Select an option (1-5):
```

**Features:**
- **Create User**: Add new users with email, password, and name
- **List Users**: Show all users with their bill counts
- **Delete User**: Remove users (with confirmation)
- **Update Password**: Change user passwords
- **Exit**: Close the application

### **4. Test Auth Script**
```bash
node scripts/test-auth.js <DATABASE_URL>
```

**What it tests:**
- Default user existence
- Password verification
- User-bill relationships
- Database connectivity

**Output:**
```
🔗 Using database URL: postgresql://***:***@localhost:5432/bill_generator?schema=public
🔗 Testing authentication system...

1. Checking default user...
✅ Default user found: subinsk284@gmail.com
   ID: 4d86ce1b-9edc-4377-8527-5ff2eb94bad9
   Name: Default User
   Created: 25/9/2025

2. Testing password verification...
✅ Password verification: PASSED

3. Checking user bills...
✅ Bills count: 2
✅ GST Bills count: 2

4. All users in database:
   1. subinsk284@gmail.com
      ID: 4d86ce1b-9edc-4377-8527-5ff2eb94bad9
      Name: Default User
      Bills: 2, GST Bills: 2
      Created: 25/9/2025

🎉 Authentication system test completed successfully!
```

## 🔒 **Security Features**

### **Password Security**
- All passwords are hashed using bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Secure password verification

### **Database URL Security**
- Database URLs are masked in output (credentials hidden)
- No hardcoded database URLs in scripts
- Support for both local and remote databases

### **User Isolation**
- Each user can only access their own bills
- User deletion cascades to remove associated data
- Proper user authentication and authorization

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Database URL is required" Error**
   ```bash
   # Solution: Provide database URL as first argument
   node scripts/add-user.js "postgresql://..." "email" "password"
   ```

2. **"User already exists" Error**
   ```bash
   # Solution: Use a different email or delete existing user first
   node scripts/manage-users.js "postgresql://..."
   # Then select option 3 to delete user
   ```

3. **Connection Failed**
   ```bash
   # Check if database is running
   # Verify database URL format
   # Ensure network connectivity
   ```

4. **Permission Denied**
   ```bash
   # Check database user permissions
   # Verify database exists
   # Ensure schema is accessible
   ```

### **Database URL Formats**

**Local PostgreSQL:**
```
postgresql://username:password@localhost:5432/database_name?schema=public
```

**Neon DB:**
```
postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
```

**Supabase:**
```
postgresql://username:password@host:port/database?sslmode=require
```

## 📊 **Database Schema**

The scripts work with the following database structure:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bills table (linked to users)
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  total_amount DECIMAL NOT NULL,
  is_draft BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GST Bills table (linked to users)
CREATE TABLE gst_bills (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR UNIQUE NOT NULL,
  bill_data TEXT NOT NULL,
  company_name VARCHAR NOT NULL,
  invoice_no VARCHAR NOT NULL,
  invoice_date VARCHAR NOT NULL,
  billed_to_name VARCHAR NOT NULL,
  grand_total DECIMAL NOT NULL,
  final_amount DECIMAL NOT NULL,
  is_draft BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **Best Practices**

1. **Always use environment variables for production**
2. **Test scripts on development database first**
3. **Keep database URLs secure and never commit them**
4. **Use strong passwords for user accounts**
5. **Regularly backup your database**
6. **Monitor user activity and access logs**

---

## 📝 **Summary**

All scripts now support:
- ✅ **Database URL parameters** - No hardcoded URLs
- ✅ **Multiple database support** - Local and remote databases
- ✅ **Security** - Password hashing and URL masking
- ✅ **Error handling** - Comprehensive error messages
- ✅ **User management** - Complete CRUD operations
- ✅ **Testing** - Authentication system verification

You can now easily switch between different databases by simply changing the URL parameter! 🚀
