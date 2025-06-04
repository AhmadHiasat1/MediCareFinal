import express from 'express';
import {
  getPatientPrescriptions,
  createPrescription,
  getPrescription
} from '../controllers/prescription.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Get patient's prescriptions
router.get('/patients/:id/prescriptions', authorize('patient', 'doctor'), getPatientPrescriptions);

// Get single prescription
router.get('/prescriptions/:prescriptionId', authorize('patient', 'doctor'), getPrescription);

// Create prescription (doctors only)
router.post('/prescriptions', authorize('doctor'), createPrescription);

export default router; 
import {
  getPatientPrescriptions,
  createPrescription,
  getPrescription
} from '../controllers/prescription.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Get patient's prescriptions
router.get('/patients/:id/prescriptions', authorize('patient', 'doctor'), getPatientPrescriptions);

// Get single prescription
router.get('/prescriptions/:prescriptionId', authorize('patient', 'doctor'), getPrescription);

// Create prescription (doctors only)
router.post('/prescriptions', authorize('doctor'), createPrescription);

export default router; 
 