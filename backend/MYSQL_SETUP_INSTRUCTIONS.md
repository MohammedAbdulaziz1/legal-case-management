# MySQL Setup Instructions

## Step 1: Update .env File

Open the `.env` file in `/Applications/XAMPP/xamppfiles/htdocs/backend/` and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=samalegal
DB_USERNAME=root
DB_PASSWORD=
```

(If your MySQL has a password, add it to `DB_PASSWORD=`)

## Step 2: Create Database in phpMyAdmin

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "New" to create a new database
3. Database name: `samalegal`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Step 3: Clear Config Cache

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/backend
php artisan config:clear
```

## Step 4: Run Migrations

```bash
php artisan migrate:fresh --force
```

This will drop all tables and recreate them.

## Step 5: Seed Database

```bash
php artisan db:seed --force
```

This will create the admin user:
- Email: `admin@firm.com`
- Password: `password`

## Step 6: Test Connection

```bash
php artisan migrate:status
```

You should see all migrations listed as "Ran".

## Step 7: Test API

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@firm.com","password":"password"}'
```

You should get a JSON response with a token.

## Troubleshooting

### Error: Access denied for user
- Check MySQL username/password in .env
- Verify MySQL is running in XAMPP

### Error: Unknown database 'samalegal'
- Create the database in phpMyAdmin first
- Check database name spelling in .env

### Error: Table already exists
- Run `php artisan migrate:fresh --force` to reset
- Or drop the database and recreate it

