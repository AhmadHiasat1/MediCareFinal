import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { getDoctorDetails, bookAppointment } from '../../store/slices/patientSlice';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedDoctor, isLoading, error } = useSelector((state) => state.patient);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: '',
    type: 'consultation',
    reason: ''
  });

  useEffect(() => {
    if (doctorId) {
      dispatch(getDoctorDetails(doctorId));
    }
  }, [dispatch, doctorId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Calculate end time (1 hour after start time)
    const [hours, minutes] = formData.timeSlot.split(':');
    const startTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${minutes.padStart(2, '0')}`;

    const appointmentData = {
      doctorId,
      appointmentDate: formData.appointmentDate,
      startTime,
      endTime,
      type: formData.type,
      reason: formData.reason
    };

    const result = await dispatch(bookAppointment(appointmentData));
    if (!result.error) {
      navigate('/patient/appointments');
    }
  };

  // Mock available time slots - replace with actual API data
  const timeSlots = [
    { id: 1, time: '09:00', label: '9:00 AM' },
    { id: 2, time: '10:00', label: '10:00 AM' },
    { id: 3, time: '11:00', label: '11:00 AM' },
    { id: 4, time: '14:00', label: '2:00 PM' },
    { id: 5, time: '15:00', label: '3:00 PM' },
    { id: 6, time: '16:00', label: '4:00 PM' },
  ];

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading doctor details...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={4} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="display-4 text-primary mb-3">
                  <i className="fas fa-user-md"></i>
                </div>
                <h3 className="mb-1">Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}</h3>
                <p className="text-muted mb-0">{selectedDoctor?.specialization}</p>
              </div>

              <div className="border-top pt-4">
                <p className="mb-2">
                  <i className="fas fa-graduation-cap text-primary me-2"></i>
                  {selectedDoctor?.qualifications}
                </p>
                <p className="mb-2">
                  <i className="fas fa-clock text-primary me-2"></i>
                  {selectedDoctor?.experience} years experience
                </p>
                <p className="mb-0">
                  <i className="fas fa-dollar-sign text-primary me-2"></i>
                  Consultation Fee: ${selectedDoctor?.consultationFee}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-4">Book an Appointment</h4>

              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Appointment Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Available Time Slots</Form.Label>
                      <Form.Select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.id} value={slot.time}>
                            {slot.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Appointment Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="first-visit">First Visit</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Reason for Visit</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Please describe your symptoms or reason for the appointment"
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <div className="d-grid">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Booking Appointment...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-calendar-check me-2"></i>
                            Confirm Appointment
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookAppointment; 
