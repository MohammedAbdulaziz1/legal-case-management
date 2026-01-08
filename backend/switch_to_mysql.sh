#!/bin/bash

# Script to switch Laravel backend to MySQL

cd /Applications/XAMPP/xamppfiles/htdocs/backend

echo "Switching to MySQL configuration..."

# Backup .env file
cp .env .env.backup

# Update database configuration
sed -i '' 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env
sed -i '' 's/^DB_DATABASE=.*/DB_DATABASE=samalegal/' .env
sed -i '' 's/^DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i '' 's/^DB_PASSWORD=.*/DB_PASSWORD=/' .env

echo "✅ Updated .env file"
echo ""
echo "Current database settings:"
grep "^DB_" .env | head -6

echo ""
echo "Clearing config cache..."
php artisan config:clear

echo ""
echo "Testing MySQL connection..."
php artisan migrate:status

echo ""
echo "✅ Configuration updated!"
echo ""
echo "Next steps:"
echo "1. Make sure MySQL is running in XAMPP"
echo "2. Create database 'samalegal' in phpMyAdmin if it doesn't exist"
echo "3. Run: php artisan migrate --force"
echo "4. Run: php artisan db:seed --force"

