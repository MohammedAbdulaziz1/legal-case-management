# ⚠️ CRITICAL: Database Configuration Issue

## Problem
The API is connecting to database **"sama"** but migrations ran on a different database. The `personal_access_tokens` table exists in one database but the app is looking in another.

## Solution

### Option 1: Create "sama" database and run migrations there

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create database: `sama`
3. Collation: `utf8mb4_unicode_ci`
4. Run migrations:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/backend
   php artisan migrate:fresh --force
   php artisan db:seed --force
   ```

### Option 2: Fix .env to use "samalegal" (Recommended)

1. **Edit `.env` file** in `/Applications/XAMPP/xamppfiles/htdocs/backend/`
2. **Make sure these lines are correct:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=samalegal
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. **Clear all caches:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```
4. **Create database `samalegal` in phpMyAdmin** if it doesn't exist
5. **Run migrations:**
   ```bash
   php artisan migrate:fresh --force
   php artisan db:seed --force
   ```

### Quick Test After Fix

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@firm.com","password":"password"}'
```

You should get a JSON response with `success: true` and a `token` field.

