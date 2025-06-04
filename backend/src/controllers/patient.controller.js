import { query, findById, update } from '../utils/db.js';

// Get patient profile
export const getPatient = async (req, res) => {
  try {
    const patientQuery = `
      SELECT 
        p.*,
        json_build_object(
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'phone', u.phone
        ) as user
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND u.is_active = true
    `;

    const patient = (await query(patientQuery, [req.params.id]))[0];

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    // Check if the logged-in user is the patient or a doctor
    if (req.user.role !== 'doctor' && patient.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to view this profile'
      });
    }

    res.json(patient);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

// Update patient profile
export const updatePatient = async (req, res) => {
  try {
    const { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory, allergies } = req.body;

    // Check if patient exists and belongs to the logged-in user
    const checkQuery = `
      SELECT p.* FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND u.id = $2
    `;
    const patient = (await query(checkQuery, [req.params.id, req.user.id]))[0];

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found or unauthorized'
      });
    }

    // Update patient profile
    const updatedPatient = await update('patients', req.params.id, {
      date_of_birth: dateOfBirth,
      gender,
      blood_group: bloodGroup,
      address,
      emergency_contact: emergencyContact,
      medical_history: medicalHistory,
      allergies
    });

    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    let appointmentsQuery = `
      SELECT 
        a.*,
        json_build_object(
          'id', d.id,
          'specialization', d.specialization,
          'qualifications', d.qualifications,
          'experience', d.experience,
          'consultationFee', d.consultation_fee,
          'user', json_build_object(
            'firstName', du.first_name,
            'lastName', du.last_name,
            'email', du.email,
            'phone', du.phone
          )
        ) as doctor
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE a.patient_id = $1
    `;

    const queryParams = [req.params.id];
    let paramCount = 2;

    if (status) {
      appointmentsQuery += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (date) {
      appointmentsQuery += ` AND a.appointment_date = $${paramCount}`;
      queryParams.push(date);
    }

    appointmentsQuery += ` ORDER BY a.appointment_date ASC, a.start_time ASC`;

    const appointments = await query(appointmentsQuery, queryParams);
    res.json(appointments);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlotId, type, reason } = req.body;

    // Get time slot details
    const timeSlotQuery = `
      SELECT * FROM time_slots
      WHERE id = $1 AND doctor_id = $2 AND is_available = true
    `;
    const timeSlot = (await query(timeSlotQuery, [timeSlotId, doctorId]))[0];

    if (!timeSlot) {
      return res.status(400).json({
        error: 'Time slot not available'
      });
    }

    // Create appointment using transaction
    const result = await transaction(async (client) => {
      // Create appointment
      const appointmentQuery = `
        INSERT INTO appointments (
          doctor_id, patient_id, appointment_date,
          start_time, end_time, type, reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const appointmentValues = [
        doctorId,
        req.params.id,
        appointmentDate,
        timeSlot.start_time,
        timeSlot.end_time,
        type,
        reason
      ];
      const appointment = (await client.query(appointmentQuery, appointmentValues)).rows[0];

      // Update time slot availability
      const updateSlotQuery = `
        UPDATE time_slots
        SET is_available = false
        WHERE id = $1
      `;
      await client.query(updateSlotQuery, [timeSlotId]);

      return appointment;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if appointment exists and belongs to the patient
    const checkQuery = `
      SELECT a.* FROM appointments a
      WHERE a.id = $1 AND a.patient_id = $2 AND a.status = 'scheduled'
    `;
    const appointment = (await query(checkQuery, [req.params.appointmentId, req.params.id]))[0];

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found or cannot be cancelled'
      });
    }

    // Cancel appointment using transaction
    const result = await transaction(async (client) => {
      // Update appointment status
      const updateAppointmentQuery = `
        UPDATE appointments
        SET status = 'cancelled', cancellation_reason = $1
        WHERE id = $2
        RETURNING *
      `;
      const updatedAppointment = (await client.query(updateAppointmentQuery, [reason, req.params.appointmentId])).rows[0];

      // Update time slot availability
      const updateSlotQuery = `
        UPDATE time_slots
        SET is_available = true
        WHERE doctor_id = $1 
        AND date = $2 
        AND start_time = $3
      `;
      await client.query(updateSlotQuery, [
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.start_time
      ]);

      return updatedAppointment;
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

// Get patient prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptionsQuery = `
      SELECT 
        p.*,
        json_build_object(
          'id', d.id,
          'specialization', d.specialization,
          'user', json_build_object(
            'firstName', u.first_name,
            'lastName', u.last_name,
            'email', u.email,
            'phone', u.phone
          )
        ) as doctor
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = $1
      ORDER BY p.date DESC
    `;

    const prescriptions = await query(prescriptionsQuery, [req.params.id]);

    res.json(prescriptions);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export default {
  getPatient,
  updatePatient,
  getPatientAppointments,
  bookAppointment,
  cancelAppointment,
  getPatientPrescriptions
}; 