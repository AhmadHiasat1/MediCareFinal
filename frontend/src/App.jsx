import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Layout components
import Navigation from './components/layout/Navigation';
import PrivateRoute from './components/auth/PrivateRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import DoctorList from './pages/patient/DoctorList';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';
import PatientPrescriptions from './pages/patient/Prescriptions';
import BookAppointment from './pages/patient/BookAppointment';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorProfile from './pages/doctor/Profile';

function App() {
  return (
    <div className="App">
      <Navigation />
      <main className="container py-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient routes */}
          <Route
            path="/patient/dashboard"
            element={
              <PrivateRoute role="patient">
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <PrivateRoute role="patient">
                <DoctorList />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <PrivateRoute role="patient">
                <PatientAppointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <PrivateRoute role="patient">
                <PatientPrescriptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <PrivateRoute role="patient">
                <PatientProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/book-appointment/:doctorId"
            element={
              <PrivateRoute role="patient">
                <BookAppointment />
              </PrivateRoute>
            }
          />

          {/* Doctor routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <PrivateRoute role="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <PrivateRoute role="doctor">
                <DoctorProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App; 