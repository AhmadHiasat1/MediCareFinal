import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Alert,
  Form
} from 'react-bootstrap';
import {
  getPatientAppointments,
  cancelAppointment
} from '../../store/slices/patientSlice';
import { format, parseISO } from 'date-fns';

const Appointments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, isLoading, error } = useSelector((state) => state.patient);

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (user?.profile?.id) {
      dispatch(
        getPatientAppointments({
          id: user.profile.id,
          params: {}
        })
      );
    }
  }, [dispatch, user]);

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (user?.profile?.id && selectedAppointment) {
      await dispatch(
        cancelAppointment({
          patientId: user.profile.id,
          appointmentId: selectedAppointment.id
        })
      );
      handleCloseModal();
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
      <h2 className="mb-4">My Appointments</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <div className="display-4 text-muted mb-3">
              <i className="fas fa-calendar-day"></i>
            </div>
            <h4>No Appointments Found</h4>
            <p className="text-muted">
              You don't have any appointments.
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
                      Dr. {appointment.doctor.user.firstName}{' '}
                      {appointment.doctor.user.lastName}
                    </h5>
                    <Badge bg={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-stethoscope me-2"></i>
                    {appointment.doctor.specialization}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-calendar me-2"></i>
                    {format(parseISO(appointment.appointmentDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-clock me-2"></i>
                    {format(
                      new Date(`2000-01-01T${appointment.startTime}`),
                      'hh:mm a'
                    )}{' '}
                    -{' '}
                    {format(
                      new Date(`2000-01-01T${appointment.endTime}`),
                      'hh:mm a'
                    )}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {appointment.type}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-comment me-2"></i>
                    {appointment.reason}
                  </p>
                  {appointment.notes && (
                    <p className="mb-2">
                      <i className="fas fa-sticky-note me-2"></i>
                      {appointment.notes}
                    </p>
                  )}
                  {appointment.status === 'scheduled' && (
                    <div className="mt-3">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelClick(appointment)}
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCancelSubmit}>
          <Modal.Body>
            <p>Are you sure you want to cancel this appointment?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              No, Keep It
            </Button>
            <Button variant="danger" type="submit" disabled={isLoading}>
              {isLoading ? 'Cancelling...' : 'Yes, Cancel It'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Appointments; 