# Medicare - Appointment Management System

A full-stack web application for managing clinic appointments between doctors and patients.

## Project Structure

```
medicare-app/
├── frontend/         # React + Vite frontend
└── backend/          # Node.js + Express backend
```

## Technologies Used

### Frontend
- React with Vite
- Bootstrap 5
- React Router DOM
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Bcrypt

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=medicare_db
   JWT_SECRET=your_jwt_secret
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

### Patient Features
- Register and login
- View doctor profiles
- Book appointments
- View appointment history
- Cancel appointments
- Edit profile

### Doctor Features
- Manage available time slots
- View upcoming appointments
- Access patient information
- Cancel appointments
- Dashboard with statistics

## API Documentation

The API documentation can be found in the backend/docs directory.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 