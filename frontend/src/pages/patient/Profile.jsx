import { useSelector } from 'react-redux';
import {
  Container,
  Card,
  Row,
  Col
} from 'react-bootstrap';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="mb-5">
                <h2 className="mb-1">My Profile</h2>
                <p className="text-muted mb-0">Your personal information</p>
              </div>

              <div className="mb-4">
                <h5 className="text-primary mb-3">Personal Information</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">First Name</p>
                    <p className="fw-bold">{user?.firstName || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p className="text-muted mb-1">Last Name</p>
                    <p className="fw-bold">{user?.lastName || 'N/A'}</p>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">Email</p>
                    <p className="fw-bold">{user?.email || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p className="text-muted mb-1">Phone</p>
                    <p className="fw-bold">{user?.profile?.phone || 'N/A'}</p>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h5 className="text-primary mb-3">Medical Information</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">Date of Birth</p>
                    <p className="fw-bold">{user?.profile?.dateOfBirth || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p className="text-muted mb-1">Gender</p>
                    <p className="fw-bold">{user?.profile?.gender || 'N/A'}</p>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">Blood Group</p>
                    <p className="fw-bold">{user?.profile?.bloodGroup || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p className="text-muted mb-1">Address</p>
                    <p className="fw-bold">{user?.profile?.address || 'N/A'}</p>
                  </Col>
                </Row>
              </div>

              <div>
                <h5 className="text-primary mb-3">Health Information</h5>
                <div className="mb-3">
                  <p className="text-muted mb-1">Allergies</p>
                  <p className="fw-bold">{user?.profile?.allergies || 'None'}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Medical History</p>
                  <p className="fw-bold">{user?.profile?.medicalHistory || 'None'}</p>
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