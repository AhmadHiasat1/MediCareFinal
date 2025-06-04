import { body, query } from 'express-validator';

export const createAppointmentValidation = [
  body('doctorId')
    .isUUID()
    .withMessage('Doctor ID is required and must be a valid UUID'),
  body('timeSlotId')
    .isUUID()
    .withMessage('Time slot ID is required and must be a valid UUID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please enter a valid appointment date'),
  body('type')
    .isIn(['first-visit', 'follow-up', 'consultation'])
    .withMessage('Type must be first-visit, follow-up, or consultation'),
  body('reason')
    .notEmpty()
    .withMessage('Reason for appointment is required')
];

export const updateAppointmentValidation = [
  body('status')
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Status must be scheduled, completed, or cancelled'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

export const getAppointmentsValidation = [
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Status must be scheduled, completed, or cancelled'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date'),
  query('from')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid from date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid to date')
]; 