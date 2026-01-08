# Legal Case Management System

A comprehensive legal case management system for tracking and managing court cases across different court levels (Primary, Appeal, and Supreme Court).

## Project Structure

```
legal-case-management/
├── frontend/          # React frontend application
├── backend/           # Laravel backend API
└── README.md          # This file
```

## Technologies

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management

### Backend
- **Laravel** - PHP framework
- **MySQL** - Database
- **Laravel Sanctum** - API authentication
- **PHPUnit** - Testing framework

## Features

- **Case Management**: Create, edit, and manage cases across three court levels
  - Primary Cases (القضايا الابتدائية)
  - Appeal Cases (القضايا الاستئنافية)
  - Supreme Court Cases (قضايا المحكمة العليا)
- **User Management**: User roles and permissions
- **Dashboard**: Statistics and overview
- **Archive Log**: Track case history and changes
- **Authentication**: Secure login and session management
- **Arabic Language Support**: Full RTL support

## Prerequisites

- **Node.js** (v16 or higher)
- **PHP** (v8.1 or higher)
- **Composer**
- **MySQL** (or XAMPP with MySQL)
- **npm** or **yarn**

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=samalegal
DB_USERNAME=root
DB_PASSWORD=
```

6. Run migrations:
```bash
php artisan migrate --seed
```

7. Start the development server:
```bash
php artisan serve
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (if needed):
```env
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Login Credentials

- **Email**: `admin@firm.com`
- **Password**: `password`

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/me` - Get current user

### Cases
- `GET /api/cases/primary` - List primary cases
- `POST /api/cases/primary` - Create primary case
- `GET /api/cases/primary/{id}` - Get primary case
- `PUT /api/cases/primary/{id}` - Update primary case
- `DELETE /api/cases/primary/{id}` - Delete primary case

- `GET /api/cases/appeal` - List appeal cases
- `POST /api/cases/appeal` - Create appeal case
- `GET /api/cases/appeal/{id}` - Get appeal case
- `PUT /api/cases/appeal/{id}` - Update appeal case
- `DELETE /api/cases/appeal/{id}` - Delete appeal case

- `GET /api/cases/supreme` - List supreme court cases
- `POST /api/cases/supreme` - Create supreme court case
- `GET /api/cases/supreme/{id}` - Get supreme court case
- `PUT /api/cases/supreme/{id}` - Update supreme court case
- `DELETE /api/cases/supreme/{id}` - Delete supreme court case

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/users` - List users
- `GET /api/users/{id}/permissions` - Get user permissions
- `PUT /api/users/{id}/permissions` - Update user permissions

### Archive
- `GET /api/archive` - Get archive logs

## Development

### Running Tests

**Backend:**
```bash
cd backend
php artisan test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
php artisan optimize
```

## Database Schema

The system uses three main case tables:
- `case_registration` - Primary court cases
- `appeal` - Appeal court cases
- `supreme_court` - Supreme court cases

Each case type has relationships and specific fields as defined in the Laravel models.

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push to the branch
5. Create a pull request

## License

This project is proprietary software.

## Support

For issues or questions, please contact the development team.

