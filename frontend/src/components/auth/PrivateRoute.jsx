import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required and user's role doesn't match, redirect to home
  if (role && user?.role !== role) {
    // Redirect doctors to their dashboard
    if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" />;
    }
    // Redirect patients to their dashboard
    if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" />;
    }
    // Default redirect to home
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute; 