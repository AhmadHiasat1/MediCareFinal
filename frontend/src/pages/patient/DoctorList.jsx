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
  Alert
} from 'react-bootstrap';
import { getDoctors } from '../../store/slices/doctorSlice';
import { bookAppointment } from '../../store/slices/patientSlice';
import { format } from 'date-fns';

const DoctorList = () => {
  const dispatch = useDispatch();
  const { doctors, isLoading: isDoctorsLoading } = useSelector(
    (state) => state.doctor
  );
  const { isLoading: isBookingLoading, error } = useSelector(
    (state) => state.patient
  );
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filters, setFilters] = useState({
    specialization: '',
    name: ''
  });
  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlotId: '',
    type: '',
    reason: ''
  });

  useEffect(() => {
    dispatch(getDoctors());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleBooking = (doctor) => {
    setSelectedDoctor(doctor);
    // In a real application, you would fetch available time slots here
    setAvailableSlots(doctor.timeSlots || []);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setFormData({
      appointmentDate: '',
      timeSlotId: '',
      type: '',
      reason: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      bookAppointment({
        id: user.profile.id,
        data: {
          doctorId: selectedDoctor.id,
          ...formData
        }
      })
    );
    if (!result.error) {
      handleCloseModal();
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialization = filters.specialization
      ? doctor.specialization
          .toLowerCase()
          .includes(filters.specialization.toLowerCase())
      : true;
    const matchesName = filters.name
      ? `${doctor.user.firstName} ${doctor.user.lastName}`
          .toLowerCase()
          .includes(filters.name.toLowerCase())
      : true;
    return matchesSpecialization && matchesName;
  });

  return (
    <Container>
      <h2 className="mb-4">Find a Doctor</h2>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Search by Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Enter doctor's name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Control
                  type="text"
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  placeholder="Enter specialization"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isDoctorsLoading ? (
        <p>Loading doctors...</p>
      ) : filteredDoctors.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <div className="display-4 text-muted mb-3">
              <i className="fas fa-user-md"></i>
            </div>
            <h4>No Doctors Found</h4>
            <p className="text-muted">
              No doctors match your search criteria. Try adjusting your filters.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredDoctors.map((doctor) => (
            <Col md={6} key={doctor.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </h5>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBooking(doctor)}
                    >
                      Book Appointment
                    </Button>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-stethoscope me-2"></i>
                    {doctor.specialization}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-graduation-cap me-2"></i>
                    {doctor.qualifications}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-briefcase me-2"></i>
                    {doctor.experience} years of experience
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-dollar-sign me-2"></i>
                    Consultation Fee: ${doctor.consultationFee}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-4">
              <h5>Doctor Details</h5>
              <p className="mb-1">
                <strong>Name:</strong> Dr. {selectedDoctor?.user.firstName}{' '}
                {selectedDoctor?.user.lastName}
              </p>
              <p className="mb-1">
                <strong>Specialization:</strong> {selectedDoctor?.specialization}
              </p>
              <p className="mb-0">
                <strong>Consultation Fee:</strong> $
                {selectedDoctor?.consultationFee}
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Appointment Date</Form.Label>
              <Form.Control
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time Slot</Form.Label>
              <Form.Select
                name="timeSlotId"
                value={formData.timeSlotId}
                onChange={handleChange}
                required
              >
                <option value="">Select a time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {format(new Date(`2000-01-01T${slot.startTime}`), 'hh:mm a')} -{' '}
                    {format(new Date(`2000-01-01T${slot.endTime}`), 'hh:mm a')}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="check-up">Check-up</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly describe your symptoms or reason for visit"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isBookingLoading}>
              {isBookingLoading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default DoctorList; 