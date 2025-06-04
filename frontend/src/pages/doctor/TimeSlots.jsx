import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal
} from 'react-bootstrap';
import {
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '../../store/slices/doctorSlice';
import { format, parseISO } from 'date-fns';

const TimeSlots = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { timeSlots, isLoading } = useSelector((state) => state.doctor);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurringDay: ''
  });

  useEffect(() => {
    if (user?.profile?.id) {
      dispatch(getDoctorTimeSlots(user.profile.id));
    }
  }, [dispatch, user]);

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSlot) {
      await dispatch(
        updateTimeSlot({
          doctorId: user.profile.id,
          slotId: editingSlot.id,
          data: formData
        })
      );
    } else {
      await dispatch(
        createTimeSlot({
          id: user.profile.id,
          data: formData
        })
      );
    }
    handleCloseModal();
  };

  const handleDelete = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      await dispatch(
        deleteTimeSlot({
          doctorId: user.profile.id,
          slotId
        })
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlot(null);
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      isRecurring: false,
      recurringDay: ''
    });
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring,
      recurringDay: slot.recurringDay || ''
    });
    setShowModal(true);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Time Slots Management</h2>
        <Button onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Add Time Slot
        </Button>
      </div>

      {isLoading ? (
        <p>Loading time slots...</p>
      ) : timeSlots.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <div className="display-4 text-muted mb-3">
              <i className="fas fa-clock"></i>
            </div>
            <h4>No Time Slots</h4>
            <p className="text-muted">
              You haven't created any time slots yet. Click the button above to add
              your first time slot.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Recurring</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td>{format(parseISO(slot.date), 'MMM dd, yyyy')}</td>
                    <td>
                      {format(new Date(`2000-01-01T${slot.startTime}`), 'hh:mm a')}{' '}
                      - {format(new Date(`2000-01-01T${slot.endTime}`), 'hh:mm a')}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          slot.isAvailable ? 'success' : 'danger'
                        }`}
                      >
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td>
                      {slot.isRecurring ? (
                        <span className="badge bg-info">{slot.recurringDay}</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(slot)}
                        disabled={!slot.isAvailable}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        disabled={!slot.isAvailable}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Make this a recurring time slot"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
            </Form.Group>

            {formData.isRecurring && (
              <Form.Group className="mb-3">
                <Form.Label>Recurring Day</Form.Label>
                <Form.Select
                  name="recurringDay"
                  value={formData.recurringDay}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </Form.Select>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading
                ? editingSlot
                  ? 'Updating...'
                  : 'Creating...'
                : editingSlot
                ? 'Update'
                : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TimeSlots; 