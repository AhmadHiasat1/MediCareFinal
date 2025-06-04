import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router; 