import express from 'express';
import {
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  addPrescription,
  updatePrescription
} from '../controllers/appointment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateAppointmentValidation, getAppointmentsValidation } from '../validations/appointment.validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Routes accessible by both doctors and patients
router.get('/', validate(getAppointmentsValidation), getAppointments);
router.get('/:id', getAppointment);

// Routes accessible by doctors only
router.put('/:appointmentId/status', authorize('doctor'), validate(updateAppointmentValidation), updateAppointmentStatus);

// Create appointment (patients only)
router.post('/', authorize('patient'), createAppointment);

// Update appointment
router.put('/:id', updateAppointment);

// Delete appointment
router.delete('/:id', deleteAppointment);

// Add/Update prescription (doctors only)
router.post('/:id/prescription', authorize('doctor'), addPrescription);
router.put('/:id/prescription', authorize('doctor'), updatePrescription);

export default router; 