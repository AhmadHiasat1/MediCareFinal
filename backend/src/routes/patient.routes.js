import express from 'express';
import {
  getPatient,
  updatePatient,
  getPatientAppointments,
  bookAppointment,
  cancelAppointment,
  getPatientPrescriptions
} from '../controllers/patient.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updatePatientValidation, cancelAppointmentValidation } from '../validations/patient.validation.js';
import { createAppointmentValidation } from '../validations/appointment.validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Routes accessible by both doctors and patients
router.get('/:id', authorize('doctor', 'patient'), getPatient);
router.get('/:id/appointments', authorize('doctor', 'patient'), getPatientAppointments);
router.get('/:id/prescriptions', authorize('doctor', 'patient'), getPatientPrescriptions);

// Routes accessible by patients only
router.put('/:id', authorize('patient'), validate(updatePatientValidation), updatePatient);
router.post('/:id/appointments', authorize('patient'), validate(createAppointmentValidation), bookAppointment);
router.post('/:id/appointments/:appointmentId/cancel', authorize('patient'), validate(cancelAppointmentValidation), cancelAppointment);

export default router; 
