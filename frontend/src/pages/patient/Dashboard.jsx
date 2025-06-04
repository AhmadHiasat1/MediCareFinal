import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getDoctors } from '../../store/slices/patientSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctors, isLoading } = useSelector((state) => state.patient);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getDoctors());
  }, [dispatch]);

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Welcome, {user?.firstName}</h2>
              <p className="text-muted mb-0">Book your appointment with our trusted doctors</p>
            </div>
            <Link to="/patient/appointments" className="btn btn-outline-primary">
              <i className="fas fa-calendar-check me-2"></i>
              My Appointments
            </Link>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 bg-primary text-white shadow-lg">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h3 className="mb-2">Book Appointment</h3>
                  <p className="mb-0">
                    Choose from our network of trusted healthcare professionals and book your appointment today.
                  </p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <img
                    src="https://img.freepik.com/free-vector/hospital-building-concept-illustration_114360-8440.jpg"
                    alt="Doctors"
                    className="img-fluid rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading doctors...</p>
        </div>
      ) : (
        <Row className="g-4">
          {doctors?.map((doctor) => (
            <Col md={6} lg={4} key={doctor.id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-center mb-4">
                    <div className="display-4 text-primary mb-3">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <h4 className="mb-1">Dr. {doctor.user.firstName} {doctor.user.lastName}</h4>
                    <p className="text-muted mb-0">{doctor.specialization}</p>
                  </div>

                  <div className="mb-4">
                    <p className="mb-2">
                      <i className="fas fa-graduation-cap text-primary me-2"></i>
                      {doctor.qualifications}
                    </p>
                    <p className="mb-2">
                      <i className="fas fa-clock text-primary me-2"></i>
                      {doctor.experience} years experience
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-dollar-sign text-primary me-2"></i>
                      Consultation Fee: ${doctor.consultationFee}
                    </p>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      <i className="fas fa-calendar-plus me-2"></i>
                      Book Appointment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Dashboard; 