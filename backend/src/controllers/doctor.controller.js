import { query, findById, update } from '../utils/db.js';

export const getDoctors = async (req, res) => {
  try {
    const doctorsQuery = `
      SELECT 
        d.*,
        json_build_object(
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'phone', u.phone
        ) as user
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.is_active = true
    `;
    
    const doctors = await query(doctorsQuery);
    res.json(doctors);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctorQuery = `
      SELECT 
        d.*,
        json_build_object(
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'phone', u.phone
        ) as user
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND u.is_active = true
    `;

    const doctor = (await query(doctorQuery, [req.params.id]))[0];

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found'
      });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { specialization, qualifications, experience, consultationFee, about, availableDays, workingHours } = req.body;

    const checkQuery = `
      SELECT d.* FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND u.id = $2
    `;
    const doctor = (await query(checkQuery, [req.params.id, req.user.id]))[0];

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found or unauthorized'
      });
    }

    const updatedDoctor = await update('doctors', req.params.id, {
      specialization,
      qualifications,
      experience,
      consultation_fee: consultationFee,
      about,
      available_days: availableDays,
      working_hours: workingHours
    });

    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const getDoctorTimeSlots = async (req, res) => {
  try {
    const timeSlotsQuery = `
      SELECT * FROM time_slots
      WHERE doctor_id = $1
      ORDER BY date ASC, start_time ASC
    `;

    const timeSlots = await query(timeSlotsQuery, [req.params.id]);
    res.json(timeSlots);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const createTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, isRecurring, recurringDay } = req.body;

    const checkQuery = `
      SELECT d.* FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND u.id = $2
    `;
    const doctor = (await query(checkQuery, [req.params.id, req.user.id]))[0];

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found or unauthorized'
      });
    }

    const createQuery = `
      INSERT INTO time_slots (
        doctor_id, date, start_time, end_time, 
        is_recurring, recurring_day
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [req.params.id, date, startTime, endTime, isRecurring, recurringDay];
    const timeSlot = (await query(createQuery, values))[0];

    res.status(201).json(timeSlot);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const updateTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, isRecurring, recurringDay } = req.body;

    const checkQuery = `
      SELECT ts.* FROM time_slots ts
      JOIN doctors d ON ts.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE ts.id = $1 AND d.id = $2 AND u.id = $3
    `;
    const timeSlot = (await query(checkQuery, [req.params.slotId, req.params.id, req.user.id]))[0];

    if (!timeSlot) {
      return res.status(404).json({
        error: 'Time slot not found or unauthorized'
      });
    }

    if (!timeSlot.is_available) {
      return res.status(400).json({
        error: 'Cannot update a booked time slot'
      });
    }

    const updateQuery = `
      UPDATE time_slots
      SET date = $1, start_time = $2, end_time = $3,
          is_recurring = $4, recurring_day = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [date, startTime, endTime, isRecurring, recurringDay, req.params.slotId];
    const updatedTimeSlot = (await query(updateQuery, values))[0];

    res.json(updatedTimeSlot);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const deleteTimeSlot = async (req, res) => {
  try {
    const checkQuery = `
      SELECT ts.* FROM time_slots ts
      JOIN doctors d ON ts.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE ts.id = $1 AND d.id = $2 AND u.id = $3
    `;
    const timeSlot = (await query(checkQuery, [req.params.slotId, req.params.id, req.user.id]))[0];

    if (!timeSlot) {
      return res.status(404).json({
        error: 'Time slot not found or unauthorized'
      });
    }

    if (!timeSlot.is_available) {
      return res.status(400).json({
        error: 'Cannot delete a booked time slot'
      });
    }

    const deleteQuery = `
      DELETE FROM time_slots
      WHERE id = $1
      RETURNING id
    `;
    await query(deleteQuery, [req.params.slotId]);

    res.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const checkQuery = `
      SELECT d.* FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND u.id = $2
    `;
    const doctor = (await query(checkQuery, [req.params.id, req.user.id]))[0];

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found or unauthorized'
      });
    }

    const appointmentsQuery = `
      SELECT 
        a.*,
        ts.date,
        ts.start_time,
        ts.end_time,
        json_build_object(
          'id', p.id,
          'user', json_build_object(
            'firstName', u.first_name,
            'lastName', u.last_name,
            'email', u.email,
            'phone', u.phone
          )
        ) as patient
      FROM appointments a
      JOIN time_slots ts ON a.time_slot_id = ts.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE ts.doctor_id = $1
      ORDER BY ts.date DESC, ts.start_time DESC
    `;

    const appointments = await query(appointmentsQuery, [req.params.id]);
    res.json(appointments);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}; 