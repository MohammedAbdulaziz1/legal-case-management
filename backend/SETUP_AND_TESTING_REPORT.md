# Setup and Testing Report

## ✅ Completed Setup Steps

1. **Backend Dependencies**: ✅ Installed (composer dependencies already present)
2. **Frontend Dependencies**: ✅ Installed (node_modules present)
3. **Database Migrations**: ✅ Ran successfully on MySQL
4. **Database Seeding**: ✅ Admin user created (admin@firm.com / password)
5. **Backend Server**: ✅ Started on http://127.0.0.1:8000
6. **Frontend Server**: ✅ Started on http://127.0.0.1:3000

## ⚠️ Current Issue

### Database Configuration Mismatch

The application is trying to connect to MySQL database `sama`, but there's a mismatch between:
- Where migrations were run
- Which database the application is trying to use

**Error**: `Table 'sama.personal_access_tokens' doesn't exist`

### Root Cause

The `.env` file is configured to use database `sama`, but the migrations may have run on a different database, or the `sama` database doesn't have all the required tables.

## 🔧 How to Fix

### Option 1: Run Migrations on the Correct Database

1. Check your `.env` file in `/Applications/XAMPP/xamppfiles/htdocs/backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sama
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

2. Ensure the database `sama` exists in MySQL:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sama;"
   ```

3. Run migrations on the correct database:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/backend
   php artisan config:clear
   php artisan migrate:fresh --force --seed
   ```

4. Restart the backend server (kill the current process and restart):
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

### Option 2: Use SQLite (Simpler for Testing)

If you want to use SQLite instead:

1. Update `.env`:
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=/Applications/XAMPP/xamppfiles/htdocs/backend/database/database.sqlite
   ```

2. Run migrations:
   ```bash
   php artisan migrate:fresh --force --seed
   ```

## 📋 Testing Checklist

Once the database issue is fixed, test these endpoints:

### Authentication
- [ ] `POST /api/auth/login` - Login with admin@firm.com / password
- [ ] `GET /api/auth/me` - Get current user (requires token)
- [ ] `POST /api/auth/logout` - Logout (requires token)

### Cases Management
- [ ] `GET /api/cases/primary` - List primary cases
- [ ] `POST /api/cases/primary` - Create primary case
- [ ] `GET /api/cases/appeal` - List appeal cases
- [ ] `GET /api/cases/supreme` - List supreme court cases

### Users & Permissions
- [ ] `GET /api/users` - List users
- [ ] `GET /api/users/{id}/permissions` - Get user permissions

### Dashboard & Archive
- [ ] `GET /api/dashboard/stats` - Dashboard statistics
- [ ] `GET /api/archive` - Archive logs

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Login Credentials**: 
  - Email: `admin@firm.com`
  - Password: `password`

## 🧪 Quick Test Script

A test script has been created at `/Applications/XAMPP/xamppfiles/htdocs/backend/test_api.sh`

Run it after fixing the database issue:
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/backend
./test_api.sh
```

## 📝 Notes

- Both servers are running in the background
- Frontend dependencies are installed
- Backend dependencies are installed
- Database structure is ready (migrations exist)
- Admin user is seeded
- The only blocker is the database connection/table mismatch

## 🚀 Next Steps

1. Fix the database configuration (see options above)
2. Restart the backend server
3. Test login endpoint
4. Test all other endpoints
5. Test frontend-backend integration

