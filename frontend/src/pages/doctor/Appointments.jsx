import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Badge
} from 'react-bootstrap';
import {
  getAppointments,
  updateAppointmentStatus
} from '../../store/slices/appointmentSlice';
import { format, parseISO } from 'date-fns';

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, isLoading } = useSelector((state) => state.appointment);

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(getAppointments({}));
  }, [dispatch]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    await dispatch(
      updateAppointmentStatus({
        id: selectedAppointment.id,
        data: formData
      })
    );
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setFormData({
      status: '',
      notes: ''
    });
  };

  const handleUpdateClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowModal(true);
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
      <h2 className="mb-4">Appointments</h2>

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
                      {appointment.patient.user.firstName}{' '}
                      {appointment.patient.user.lastName}
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
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateClick(appointment)}
                      >
                        Update Status
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
          <Modal.Title>Update Appointment Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                required
              >
                <option value="">Select Status</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about the appointment..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Appointments; 