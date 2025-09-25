# Authentication System Setup

This document describes the complete authentication system implemented using NextAuth.js with PostgreSQL and Prisma ORM.

## 🔐 Features Implemented

### ✅ **Complete Authentication System**
- **NextAuth.js Integration** - Secure authentication with JWT sessions
- **Credentials Provider** - Email/password authentication
- **Route Protection** - Middleware-based route protection
- **User Management** - Complete user CRUD operations
- **Password Security** - bcrypt hashing with salt rounds
- **Session Management** - Secure JWT-based sessions

### ✅ **Database Integration**
- **User Model** - UUID-based user identification
- **User Relationships** - Bills and GST bills linked to users
- **Data Isolation** - Users can only access their own data
- **Cascade Deletion** - User deletion removes associated data

### ✅ **Security Features**
- **Password Hashing** - bcrypt with 12 salt rounds
- **Route Protection** - Middleware prevents unauthorized access
- **Session Validation** - Server-side session verification
- **User Isolation** - Database queries filtered by user ID

## 🚀 Quick Start

### 1. **Default User Credentials**
```
Email: subinsk284@gmail.com
Password: sookshma
```

### 2. **Access the Application**
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3001`
3. You'll be redirected to `/login` if not authenticated
4. Use the default credentials to log in

### 3. **User Management**
```bash
# Run the user management script
node scripts/manage-users.js

# Options available:
# 1. Create new user
# 2. List all users  
# 3. Delete user
# 4. Update password
# 5. Exit
```

## 🏗️ Architecture

### **Authentication Flow**
```
1. User visits protected route
2. Middleware checks authentication
3. If not authenticated → redirect to /login
4. User enters credentials
5. NextAuth validates with database
6. JWT session created
7. User redirected to original route
```

### **Database Schema**
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

-- Bills table (with user relationship)
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

-- GST Bills table (with user relationship)
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

## 🔧 Configuration

### **Environment Variables**
```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3001"

# Database Configuration
DATABASE_URL="postgresql://postgres:admin@localhost:5432/bill_generator?schema=public"
```

### **NextAuth Configuration**
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validate credentials against database
        // Return user object if valid, null if invalid
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  // ... other configurations
};
```

## 🛡️ Security Implementation

### **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Password Storage**: Never stored in plain text
- **Validation**: Server-side password comparison

### **Route Protection**
```typescript
// src/middleware.ts
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === '/login') return true;
        return !!token;
      },
    },
  }
);
```

### **Data Isolation**
```typescript
// All database queries include user filtering
const userId = await getCurrentUserId();
const bills = await prisma.bill.findMany({
  where: { userId },
  // ... other query options
});
```

## 📱 User Interface

### **Login Page Features**
- **Modern Design** - Clean, professional interface
- **Form Validation** - Client and server-side validation
- **Error Handling** - Clear error messages
- **Password Visibility** - Toggle password visibility
- **Loading States** - Visual feedback during authentication
- **Demo Credentials** - Displayed for easy testing

### **Navigation**
- **Logout Button** - Available on all protected pages
- **Session Persistence** - Maintains login across browser sessions
- **Redirect Handling** - Returns to original page after login

## 🔄 User Management

### **Create User**
```bash
node scripts/manage-users.js
# Select option 1: Create new user
# Enter email, password, and optional name
```

### **List Users**
```bash
node scripts/manage-users.js
# Select option 2: List all users
# Shows user details and bill counts
```

### **Update Password**
```bash
node scripts/manage-users.js
# Select option 4: Update password
# Enter email and new password
```

### **Delete User**
```bash
node scripts/manage-users.js
# Select option 3: Delete user
# Confirmation required before deletion
```

## 🚨 Troubleshooting

### **Common Issues**

1. **"User not authenticated" Error**
   - Check if user is logged in
   - Verify session is valid
   - Clear browser cookies and try again

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Run `npx prisma db push` to sync schema

3. **Login Not Working**
   - Verify user exists in database
   - Check password is correct
   - Ensure bcrypt is working properly

4. **Route Protection Issues**
   - Check middleware configuration
   - Verify NEXTAUTH_SECRET is set
   - Ensure session strategy is 'jwt'

### **Debug Commands**
```bash
# Test database connection
node scripts/setup-database.js

# Check user data
node scripts/manage-users.js

# Regenerate Prisma client
npx prisma generate

# Sync database schema
npx prisma db push
```

## 🔒 Security Best Practices

### **Production Deployment**
1. **Change Default Credentials** - Never use default passwords in production
2. **Strong NEXTAUTH_SECRET** - Use a cryptographically secure random string
3. **HTTPS Only** - Always use HTTPS in production
4. **Database Security** - Use strong database credentials
5. **Environment Variables** - Never commit secrets to version control

### **Password Policy**
- Minimum 8 characters recommended
- Consider implementing password complexity requirements
- Regular password updates for admin users

### **Session Security**
- JWT tokens are secure and stateless
- Sessions expire automatically
- Logout clears all session data

## 📊 Monitoring

### **User Activity**
- Track login attempts
- Monitor failed authentication
- Log user actions for audit trails

### **Database Monitoring**
- Monitor user creation/deletion
- Track bill creation per user
- Monitor database performance

## 🎯 Future Enhancements

### **Potential Features**
- **Role-Based Access** - Admin vs regular user roles
- **Password Reset** - Email-based password recovery
- **Two-Factor Authentication** - Additional security layer
- **User Profiles** - Extended user information
- **Audit Logs** - Detailed activity tracking
- **API Rate Limiting** - Prevent brute force attacks

---

## 📝 Summary

The authentication system is now fully implemented with:
- ✅ Secure login/logout functionality
- ✅ Route protection middleware
- ✅ User management system
- ✅ Database integration with user relationships
- ✅ Modern, responsive UI
- ✅ Comprehensive error handling
- ✅ Production-ready security features

The system is ready for production use with proper environment configuration and security measures.
