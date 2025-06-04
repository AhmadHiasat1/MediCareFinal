import { body } from 'express-validator';

export const updateDoctorValidation = [
  body('specialization')
    .optional()
    .notEmpty()
    .withMessage('Specialization cannot be empty'),
  body('qualifications')
    .optional()
    .notEmpty()
    .withMessage('Qualifications cannot be empty'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('about')
    .optional()
    .isString()
    .withMessage('About must be a string'),
  body('availableDays')
    .optional()
    .isArray()
    .withMessage('Available days must be an array')
    .custom((value) => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return value.every(day => validDays.includes(day));
    })
    .withMessage('Available days must be valid weekdays'),
  body('workingHours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object')
    .custom((value) => {
      if (!value.start || !value.end) {
        throw new Error('Working hours must have start and end times');
      }
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value.start) || !timeRegex.test(value.end)) {
        throw new Error('Working hours must be in HH:mm format');
      }
      return true;
    })
];

export const createTimeSlotValidation = [
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format')
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('Is recurring must be a boolean'),
  body('recurringDay')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Recurring day must be a valid weekday')
]; 