import { body } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('phone')
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please enter a valid phone number'),
  body('role')
    .isIn(['doctor', 'patient'])
    .withMessage('Role must be either doctor or patient'),
  // Doctor specific validations
  body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors'),
  body('qualifications')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Qualifications are required for doctors'),
  body('experience')
    .if(body('role').equals('doctor'))
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('consultationFee')
    .if(body('role').equals('doctor'))
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  // Patient specific validations
  body('dateOfBirth')
    .if(body('role').equals('patient'))
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('gender')
    .if(body('role').equals('patient'))
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]; 