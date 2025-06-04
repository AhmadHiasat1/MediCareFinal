import { body } from 'express-validator';

export const updatePatientValidation = [
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('bloodGroup')
    .optional()
    .matches(/^(A|B|AB|O)[+-]$/)
    .withMessage('Please enter a valid blood group'),
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  body('emergencyContact')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please enter a valid emergency contact number'),
  body('medicalHistory')
    .optional()
    .isString()
    .withMessage('Medical history must be a string'),
  body('allergies')
    .optional()
    .isString()
    .withMessage('Allergies must be a string')
];

export const cancelAppointmentValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isString()
    .withMessage('Reason must be a string')
]; 