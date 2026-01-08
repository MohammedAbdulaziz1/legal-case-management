# Legal Case Management System - Backend API

Laravel 11 backend API for the Legal Case Management System.

## Features

- Authentication with Laravel Sanctum
- Primary Cases Management (CRUD)
- Appeal Cases Management (CRUD)
- Supreme Court Cases Management (CRUD)
- User Management with Permissions
- Archive/History Tracking
- Dashboard Statistics

## Setup Instructions

### 1. Install Dependencies

```bash
composer install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

### 3. Database Configuration

Update your `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=samalegal
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Seed Database

Create the initial admin user:

```bash
php artisan db:seed
```

Default admin credentials:
- Email: `admin@firm.com`
- Password: `password`

### 6. Configure CORS

The API is configured to accept requests from the frontend. Make sure your frontend URL is allowed in the CORS configuration.

### 7. Start the Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Primary Cases
- `GET /api/cases/primary` - List cases
- `GET /api/cases/primary/{id}` - Get case
- `POST /api/cases/primary` - Create case
- `PUT /api/cases/primary/{id}` - Update case
- `DELETE /api/cases/primary/{id}` - Delete case

### Appeal Cases
- `GET /api/cases/appeal` - List cases
- `GET /api/cases/appeal/{id}` - Get case
- `POST /api/cases/appeal` - Create case
- `PUT /api/cases/appeal/{id}` - Update case
- `DELETE /api/cases/appeal/{id}` - Delete case

### Supreme Court Cases
- `GET /api/cases/supreme` - List cases
- `GET /api/cases/supreme/{id}` - Get case
- `POST /api/cases/supreme` - Create case
- `PUT /api/cases/supreme/{id}` - Update case
- `DELETE /api/cases/supreme/{id}` - Delete case

### Users
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/{id}/permissions` - Get user permissions
- `PUT /api/users/{id}/permissions` - Update user permissions

### Archive
- `GET /api/archive` - List archive entries
- `GET /api/archive/{id}` - Get archive entry
- `GET /api/archive/case/{caseType}/{caseId}` - Get case history
- `GET /api/archive/export` - Export archive

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is obtained from the login endpoint and should be stored in the frontend.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {...},
  "meta": {...}
}
```

For paginated responses, the `meta` object contains pagination information.

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `permissions` - User permissions
- `case_registration` - Primary cases
- `appeal` - Appeal cases
- `supreme_court` - Supreme court cases
- `archive_logs` - Case modification history

## Notes

- All timestamps are in UTC
- All text fields support Arabic characters (UTF-8)
- Case statuses: `active`, `pending`, `judgment`, `closed`, `postponed`
- User roles: `admin`, `lawyer`, `trainee`, `clerk`
