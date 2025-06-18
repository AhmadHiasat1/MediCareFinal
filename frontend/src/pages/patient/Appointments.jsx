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
import axios from 'axios';

const Appointments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, isLoading, error } = useSelector((state) => state.patient);

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ appointmentDate: '', startTime: '', endTime: '' });
  const [editError, setEditError] = useState('');

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

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointmentDate || appointment.appointment_date || '',
      startTime: appointment.startTime || appointment.start_time || '',
      endTime: appointment.endTime || appointment.end_time || ''
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/patients/${user.profile.id}/appointments/${selectedAppointment.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setSelectedAppointment(null);
      dispatch(getPatientAppointments({ id: user.profile.id, params: {} }));
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update appointment');
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
                      Dr. {appointment.doctor?.user?.firstName || 'N/A'}{' '}
                      {appointment.doctor?.user?.lastName || 'N/A'}
                    </h5>
                    <Badge bg={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-stethoscope me-2"></i>
                    {appointment.doctor?.specialization || 'N/A'}
                  </p>
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
                  {appointment.prescription ? (
                    <>
                      <p className="mb-2">
                        <i className="fas fa-notes-medical me-2"></i>
                        <strong>Diagnosis:</strong> {appointment.prescription.diagnosis || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <i className="fas fa-pills me-2"></i>
                        <strong>Medications:</strong> {appointment.prescription.medications || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <i className="fas fa-calendar-check me-2"></i>
                        <strong>Follow-up:</strong> {appointment.prescription.followUpDate || appointment.prescription.follow_up_date || 'N/A'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">
                        <i className="fas fa-comment me-2"></i>
                        {appointment.reason || 'N/A'}
                      </p>
                      {appointment.notes && (
                        <p className="mb-2">
                          <i className="fas fa-sticky-note me-2"></i>
                          {appointment.notes}
                        </p>
                      )}
                    </>
                  )}
                  {appointment.status === 'scheduled' && (
                    <div className="mt-3 d-flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(appointment)}
                      >
                        Edit
                      </Button>
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="appointmentDate"
                value={editForm.appointmentDate}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={editForm.startTime}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={editForm.endTime}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Appointments; 