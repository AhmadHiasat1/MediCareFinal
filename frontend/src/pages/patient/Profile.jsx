import { useEffect } from 'react';
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
                <h5 className="text-primary mb-3">Medical History</h5>
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile.phone || '',
        dateOfBirth: user.profile.dateOfBirth || '',
        gender: user.profile.gender || '',
        address: user.profile.address || '',
        bloodGroup: user.profile.bloodGroup || '',
        allergies: user.profile.allergies || '',
        medicalHistory: user.profile.medicalHistory || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.profile?.id) {
      const result = await dispatch(
        updatePatientProfile({
          id: user.profile.id,
          data: formData
        })
      );
      if (!result.error) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                  <h2 className="mb-1">My Profile</h2>
                  <p className="text-muted mb-0">Manage your personal information</p>
                </div>
                <Button
                  variant={isEditing ? "outline-primary" : "primary"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </>
                  ) : (
                    <>
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {successMessage && (
                <Alert variant="success" className="mb-4">
                  <i className="fas fa-check-circle me-2"></i>
                  {successMessage}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="border-bottom pb-4 mb-4">
                  <h4 className="text-primary mb-4">Personal Information</h4>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="border-bottom pb-4 mb-4">
                  <h4 className="text-primary mb-4">Medical Information</h4>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control-lg"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Blood Group</Form.Label>
                        <Form.Control
                          type="text"
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={1}
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="mb-4">
                  <h4 className="text-primary mb-4">Health Information</h4>
                  <Row className="g-4">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Allergies</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={!isEditing && !formData.allergies ? 'No allergies specified' : ''}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Medical History</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="medicalHistory"
                          value={formData.medicalHistory}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder={!isEditing && !formData.medicalHistory ? 'No medical history recorded' : ''}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {isEditing && (
                  <div className="text-end">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="px-5"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 