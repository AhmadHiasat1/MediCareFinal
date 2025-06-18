import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { logout } from '../../store/slices/authSlice';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-hospital me-2"></i>
          Medicare
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            ) : user?.role === 'patient' ? (
              <>
                <Nav.Link as={Link} to="/patient/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/patient/appointments">
                  My Appointments
                </Nav.Link>
                <Nav.Link as={Link} to="/patient/prescriptions">
                  My Prescriptions
                </Nav.Link>
                <Nav.Link as={Link} to="/patient/profile">
                  Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : user?.role === 'doctor' ? (
              <>
                <Nav.Link as={Link} to="/doctor/dashboard">
                  Dashboard & Appointments
                </Nav.Link>
                <Nav.Link as={Link} to="/doctor/profile">
                  Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 
