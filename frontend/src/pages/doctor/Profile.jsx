import { useSelector } from 'react-redux';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="display-4 text-primary mb-3">
                  <i className="fas fa-user-md"></i>
                </div>
                <h2 className="mb-1">Dr. {user?.firstName} {user?.lastName}</h2>
                <p className="text-muted mb-0">{user?.profile?.specialization}</p>
              </div>

              <div className="profile-info">
                <div className="border-bottom pb-4 mb-4">
                  <h4 className="text-primary mb-4">Personal Information</h4>
                  <Row className="g-4">
                    <Col md={6}>
                      <div>
                        <h6 className="text-muted mb-1">Email Address</h6>
                        <p className="h6 mb-0">{user?.email}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <h6 className="text-muted mb-1">Phone Number</h6>
                        <p className="h6 mb-0">{user?.phone || 'Not provided'}</p>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div>
                  <h4 className="text-primary mb-4">Professional Details</h4>
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Qualifications</h6>
                    <p className="h6 mb-0">{user?.profile?.qualifications || 'Not specified'}</p>
                  </div>

                  <Row className="g-4">
                    <Col md={6}>
                      <div>
                        <h6 className="text-muted mb-2">Years of Experience</h6>
                        <p className="h6 mb-0">{user?.profile?.experience} years</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <h6 className="text-muted mb-2">Consultation Fee</h6>
                        <p className="h6 mb-0">${user?.profile?.consultationFee}</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 