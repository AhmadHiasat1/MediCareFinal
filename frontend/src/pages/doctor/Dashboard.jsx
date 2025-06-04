import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Modal,
  Alert
} from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { getAppointments, addPrescription } from '../../store/slices/appointmentSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, isLoading, error } = useSelector((state) => state.appointment);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medications: '',
    instructions: '',
    followUpDate: ''
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(getAppointments({
        doctorId: user.id
      }));
    }
  }, [dispatch, user]);

  const handlePrescriptionClick = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionData({
      diagnosis: appointment.prescription?.diagnosis || '',
      medications: appointment.prescription?.medications || '',
      instructions: appointment.prescription?.instructions || '',
      followUpDate: appointment.prescription?.followUpDate || ''
    });
    setShowPrescriptionModal(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (selectedAppointment?.id) {
      await dispatch(addPrescription({
        appointmentId: selectedAppointment.id,
        prescriptionData
      }));
      setShowPrescriptionModal(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Welcome, Dr. {user?.firstName}</h2>
          <p className="text-muted">Manage your appointments and prescriptions</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <div className="text-center">
          <span className="spinner-border text-primary" role="status" />
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <div className="display-4 text-muted mb-3">
              <i className="fas fa-calendar-day"></i>
            </div>
            <h4>No Appointments Found</h4>
            <p className="text-muted">
              You don't have any appointments at the moment.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {appointments.map((appointment) => (
            <Col md={6} key={appointment.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                    </h5>
                    <Badge bg={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-calendar me-2"></i>
                    {format(parseISO(appointment.appointmentDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-clock me-2"></i>
                    {format(parseISO(`2000-01-01T${appointment.startTime}`), 'hh:mm a')} -{' '}
                    {format(parseISO(`2000-01-01T${appointment.endTime}`), 'hh:mm a')}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {appointment.type}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-comment me-2"></i>
                    {appointment.reason}
                  </p>

                  {appointment.prescription && (
                    <div className="mt-3 p-2 bg-light rounded">
                      <h6 className="mb-2">Prescription Details:</h6>
                      <p className="small mb-1">
                        <strong>Diagnosis:</strong> {appointment.prescription.diagnosis}
                      </p>
                      <p className="small mb-1">
                        <strong>Medications:</strong> {appointment.prescription.medications}
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      variant={appointment.prescription ? "outline-primary" : "primary"}
                      size="sm"
                      onClick={() => handlePrescriptionClick(appointment)}
                    >
                      {appointment.prescription ? "Update Prescription" : "Add Prescription"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAppointment?.prescription ? 'Update Prescription' : 'Add Prescription'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePrescriptionSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type="text"
                value={prescriptionData.diagnosis}
                onChange={(e) =>
                  setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medications</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={prescriptionData.medications}
                onChange={(e) =>
                  setPrescriptionData({ ...prescriptionData, medications: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={prescriptionData.instructions}
                onChange={(e) =>
                  setPrescriptionData({ ...prescriptionData, instructions: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Follow-up Date</Form.Label>
              <Form.Control
                type="date"
                value={prescriptionData.followUpDate}
                onChange={(e) =>
                  setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Prescription'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Dashboard; 