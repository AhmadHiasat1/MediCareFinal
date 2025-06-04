import express from 'express';
import {
  getDoctors,
  getDoctor,
  updateDoctor,
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getDoctorAppointments
} from '../controllers/doctor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateDoctorValidation, createTimeSlotValidation } from '../validations/doctor.validation.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/time-slots', getDoctorTimeSlots);

// Protected routes (doctors only)
router.use(protect);
router.use(authorize('doctor'));

router.put('/:id', validate(updateDoctorValidation), updateDoctor);
router.post('/:id/time-slots', validate(createTimeSlotValidation), createTimeSlot);
router.put('/:id/time-slots/:slotId', validate(createTimeSlotValidation), updateTimeSlot);
router.delete('/:id/time-slots/:slotId', deleteTimeSlot);
router.get('/:id/appointments', getDoctorAppointments);

export default router; 