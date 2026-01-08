# Fix Database Configuration Issue

## Problem
The API is trying to use database "sama" but migrations ran on a different database. The `personal_access_tokens` table is missing.

## Solution

### Step 1: Update .env File
Make sure your `.env` file has:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=samalegal
DB_USERNAME=root
DB_PASSWORD=
```

### Step 2: Clear All Caches
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Step 3: Create Database in phpMyAdmin
1. Go to http://localhost/phpmyadmin
2. Create database: `samalegal`
3. Collation: `utf8mb4_unicode_ci`

### Step 4: Run All Migrations Fresh
```bash
php artisan migrate:fresh --force
```

This will:
- Drop all existing tables
- Recreate all tables including `personal_access_tokens`
- Run all migrations

### Step 5: Seed Database
```bash
php artisan db:seed --force
```

### Step 6: Test API
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@firm.com","password":"password"}'
```

You should get a JSON response with a token.

