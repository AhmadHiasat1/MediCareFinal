import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1 className="display-4 mb-4">Welcome to Medicare</h1>
          <p className="lead mb-4">
            Your trusted platform for managing medical appointments with top
            healthcare professionals. Experience seamless booking and efficient
            healthcare management.
          </p>
        </Col>
        <Col md={6}>
          <img
            src="https://img.freepik.com/free-vector/hospital-building-concept-illustration_114360-8440.jpg"
            alt="Medicare"
            className="img-fluid"
          />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Our Services</h2>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 mb-3 text-primary">
                <i className="fas fa-calendar-check"></i>
              </div>
              <Card.Title>Easy Appointment Booking</Card.Title>
              <Card.Text>
                Book appointments with your preferred doctors at your convenience.
                Manage and track your appointments effortlessly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 mb-3 text-primary">
                <i className="fas fa-user-md"></i>
              </div>
              <Card.Title>Expert Doctors</Card.Title>
              <Card.Text>
                Access a network of qualified healthcare professionals. View their
                profiles, specializations, and availability.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 mb-3 text-primary">
                <i className="fas fa-clock"></i>
              </div>
              <Card.Title>Flexible Scheduling</Card.Title>
              <Card.Text>
                Choose from various time slots that fit your schedule. Receive
                timely reminders for your appointments.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 