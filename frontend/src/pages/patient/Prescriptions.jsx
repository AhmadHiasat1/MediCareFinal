import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert
} from 'react-bootstrap';
import { getPatientPrescriptions } from '../../store/slices/patientSlice';
import { format, parseISO } from 'date-fns';

const Prescriptions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { prescriptions, isLoading, error } = useSelector((state) => state.patient);

  useEffect(() => {
    if (user?.profile?.id) {
      dispatch(getPatientPrescriptions(user.profile.id));
    }
  }, [dispatch, user]);

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2>My Prescriptions</h2>
        <p className="text-muted">View all your prescriptions and medications</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <div className="display-4 text-muted mb-3">
              <i className="fas fa-prescription"></i>
            </div>
            <h4>No Prescriptions Found</h4>
            <p className="text-muted">
              You don't have any prescriptions yet.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {prescriptions.map((prescription) => (
            <Col md={6} key={prescription.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      Dr. {prescription.doctor.user.firstName} {prescription.doctor.user.lastName}
                    </h5>
                    <Badge bg="primary">
                      {format(parseISO(prescription.date), 'MMM dd, yyyy')}
                    </Badge>
                  </div>

                  <p className="mb-2">
                    <i className="fas fa-stethoscope me-2"></i>
                    {prescription.doctor.specialization}
                  </p>

                  <hr className="my-3" />

                  <h6 className="mb-3">Medications</h6>
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="mb-3 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between">
                        <strong>{medication.name}</strong>
                        <span>{medication.dosage}</span>
                      </div>
                      <p className="text-muted mb-1">
                        <i className="fas fa-clock me-2"></i>
                        {medication.frequency}
                      </p>
                      {medication.duration && (
                        <p className="text-muted mb-0">
                          <i className="fas fa-calendar me-2"></i>
                          Duration: {medication.duration}
                        </p>
                      )}
                    </div>
                  ))}

                  {prescription.instructions && (
                    <>
                      <h6 className="mb-2">Instructions</h6>
                      <p className="mb-0 text-muted">
                        <i className="fas fa-info-circle me-2"></i>
                        {prescription.instructions}
                      </p>
                    </>
                  )}

                  {prescription.notes && (
                    <>
                      <hr className="my-3" />
                      <h6 className="mb-2">Additional Notes</h6>
                      <p className="mb-0 text-muted">
                        <i className="fas fa-sticky-note me-2"></i>
                        {prescription.notes}
                      </p>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Prescriptions; 
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Prescriptions; 