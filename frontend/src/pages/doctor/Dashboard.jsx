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
    followUpDate: ''
  });
  const [prescriptionError, setPrescriptionError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAppointments({
        doctorId: user.id
      }));
    }
  }, [dispatch, user]);

  const handlePrescriptionClick = (appointment) => {
    // Only allow adding prescription if one doesn't exist
    if (!appointment.prescription) {
      setSelectedAppointment(appointment);
      setPrescriptionData({
        diagnosis: '',
        medications: '',
        followUpDate: ''
      });
      setPrescriptionError(null);
      setShowPrescriptionModal(true);
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (selectedAppointment?.id) {
      const resultAction = await dispatch(addPrescription({
        appointmentId: selectedAppointment.id,
        prescriptionData
      }));
      if (addPrescription.rejected.match(resultAction)) {
        // If prescription already exists, refetch appointments
        setPrescriptionError(resultAction.payload || 'Failed to add prescription');
        dispatch(getAppointments({ doctorId: user.id }));
      } else {
        setShowPrescriptionModal(false);
        setPrescriptionError(null);
      }
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // Handle different time formats
      let timeToFormat = timeString;
      
      // If it's already in HH:MM format, add seconds
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        timeToFormat = `${timeString}:00`;
      }
      
      // If it's in HH:MM:SS format, use it as is
      if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        timeToFormat = timeString;
      }
      
      // Create a proper date object for formatting
      const [hours, minutes, seconds = '00'] = timeToFormat.split(':');
      const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes), parseInt(seconds));
      
      return format(date, 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString || 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString || 'N/A';
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
                      {appointment.patient?.user?.firstName || 'N/A'} {appointment.patient?.user?.lastName || 'N/A'}
                    </h5>
                    <Badge bg={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-calendar me-2"></i>
                    {formatDate(appointment.appointmentDate || appointment.appointment_date)}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-clock me-2"></i>
                    {formatTime(appointment.startTime || appointment.start_time)} - {formatTime(appointment.endTime || appointment.end_time)}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {appointment.type || appointment.type || 'N/A'}
                  </p>

                  {appointment.prescription && (
                    <div className="mt-3 p-2 bg-light rounded">
                      <h6 className="mb-2">Prescription Details:</h6>
                      <p className="small mb-1">
                        <strong>Diagnosis:</strong> {appointment.prescription.diagnosis || 'N/A'}
                      </p>
                      <p className="small mb-1">
                        <strong>Medications:</strong> {appointment.prescription.medications || 'N/A'}
                      </p>
                      {appointment.prescription.followUpDate && (
                        <p className="small mb-0">
                          <strong>Follow-up:</strong> {formatDate(appointment.prescription.followUpDate)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    {(!appointment.prescription || !appointment.prescription.diagnosis) && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePrescriptionClick(appointment)}
                      >
                        Add Prescription
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Prescription</Modal.Title>
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