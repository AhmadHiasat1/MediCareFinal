# Medicare - Appointment Management System

A full-stack web application for managing clinic appointments between doctors and patients, featuring role-based access, prescription management, and flexible scheduling.

## Project Structure

```
medicare-app/
├── frontend/         # React + Vite frontend
└── backend/          # Node.js + Express backend
```

## Technologies Used

### Frontend
- React 18.2 (with Vite)
- Redux Toolkit (State Management)
- Bootstrap 5 (UI Framework)
- React Router DOM (Routing)
- Axios (HTTP Client)
- React Toastify (Notifications)
- Formik + Yup (Form Management)
- React Calendar (Date/Time Selection)
- FontAwesome (Icons)

### Backend
- Node.js
- Express.js
- PostgreSQL
- node-postgres (pg)
- JWT Authentication
- Bcryptjs (Password Hashing)
- Express-validator (Input Validation)
- CORS
- Dotenv

## Database Schema

- `users`: Authentication and basic user info
- `doctors`: Doctor profiles (specialization, experience, etc.)
- `patients`: Patient profiles (medical info, emergency contact, etc.)
- `time_slots`: Doctor-available appointment slots
- `appointments`: Booked appointments
- `prescriptions`: Medical prescriptions linked to appointments

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
3. Create a `.env` file with the following variables:
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
- View doctor list and profiles
- Book appointments with doctors
- View and manage appointment history
- Cancel appointments
- View and update profile
- View prescription history

### Doctor Features
- Register and login
- Manage own profile (specialization, experience, etc.)
- Create, update, and delete available time slots
- View upcoming appointments
- Cancel appointments
- Create and manage prescriptions for patients
- Dashboard with statistics

### Common Features
- JWT-based authentication and role-based access control
- Responsive UI for desktop and mobile
- Toast notifications for user feedback
- Form validation and error handling

## API Overview

All API endpoints are prefixed with `/api`.

### Auth
- `POST /api/auth/register` - Register as doctor or patient
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor profile
- `PUT /api/doctors/:id` - Update doctor profile (doctor only)
- `GET /api/doctors/:id/time-slots` - Get doctor's time slots
- `POST /api/doctors/:id/time-slots` - Create time slot (doctor only)
- `PUT /api/doctors/:id/time-slots/:slotId` - Update time slot (doctor only)
- `DELETE /api/doctors/:id/time-slots/:slotId` - Delete time slot (doctor only)
- `GET /api/doctors/:id/appointments` - Get doctor's appointments

### Patients
- `GET /api/patients/:id` - Get patient profile
- `PUT /api/patients/:id` - Update patient profile (patient only)
- `GET /api/patients/:id/appointments` - Get patient appointments
- `POST /api/patients/:id/appointments` - Book appointment (patient only)
- `POST /api/patients/:id/appointments/:appointmentId/cancel` - Cancel appointment (patient only)
- `PUT /api/patients/:id/appointments/:appointmentId` - Update appointment (patient only)
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions

### Appointments
- `GET /api/appointments` - List appointments (doctor/patient)
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment (patient only)
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `PUT /api/appointments/:appointmentId/status` - Update appointment status (doctor only)
- `POST /api/appointments/:id/prescription` - Add prescription (doctor only)
- `PUT /api/appointments/:id/prescription` - Update prescription (doctor only)

### Prescriptions
- `GET /api/patients/:id/prescriptions` - Get all prescriptions for a patient
- `GET /api/prescriptions/:prescriptionId` - Get prescription details
- `POST /api/prescriptions` - Create prescription (doctor only)

## Development Notes

- **Migrations**: SQL migrations are in `backend/src/database/migrations.sql` and run via `npm run migrate`.
- **Environment**: Use `.env` for sensitive config.
- **Testing**: Health check at `/api/health`.
- **State Management**: Redux Toolkit is used for frontend state.
- **Styling**: Bootstrap 5 and custom CSS in `frontend/src/styles/theme.css`.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 