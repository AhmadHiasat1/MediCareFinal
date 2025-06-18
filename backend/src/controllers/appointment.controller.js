import { query, transaction } from '../utils/db.js';

export const getAppointments = async (req, res) => {
  try {
    const { status, date, from, to } = req.query;

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
        ) as doctor,
        json_build_object(
          'id', p.id,
          'dateOfBirth', p.date_of_birth,
          'gender', p.gender,
          'bloodGroup', p.blood_group,
          'user', json_build_object(
            'firstName', pu.first_name,
            'lastName', pu.last_name,
            'email', pu.email,
            'phone', pu.phone
          )
        ) as patient
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    if (req.user.role === 'doctor') {
      appointmentsQuery += ` AND d.user_id = $${paramCount}`;
      queryParams.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'patient') {
      appointmentsQuery += ` AND p.user_id = $${paramCount}`;
      queryParams.push(req.user.id);
      paramCount++;
    }

    if (status) {
      appointmentsQuery += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (date) {
      appointmentsQuery += ` AND a.appointment_date = $${paramCount}`;
      queryParams.push(date);
      paramCount++;
    } else if (from && to) {
      appointmentsQuery += ` AND a.appointment_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(from, to);
      paramCount += 2;
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

export const getAppointment = async (req, res) => {
  try {
    const appointmentQuery = `
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
        ) as doctor,
        json_build_object(
          'id', p.id,
          'dateOfBirth', p.date_of_birth,
          'gender', p.gender,
          'bloodGroup', p.blood_group,
          'user', json_build_object(
            'firstName', pu.first_name,
            'lastName', pu.last_name,
            'email', pu.email,
            'phone', pu.phone
          )
        ) as patient
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE a.id = $1
    `;

    const appointment = (await query(appointmentQuery, [req.params.id]))[0];

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    if (req.user.role === 'doctor' && appointment.doctor.user.id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to view this appointment'
      });
    } else if (req.user.role === 'patient' && appointment.patient.user.id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to view this appointment'
      });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    let appointmentsQuery = `
      SELECT 
        a.*,
        json_build_object(
          'id', p.id,
          'dateOfBirth', p.date_of_birth,
          'gender', p.gender,
          'bloodGroup', p.blood_group,
          'user', json_build_object(
            'firstName', pu.first_name,
            'lastName', pu.last_name,
            'email', pu.email,
            'phone', pu.phone
          )
        ) as patient
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE a.doctor_id = $1
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

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const checkQuery = `
      SELECT a.* FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.id = $1 AND u.id = $2
    `;
    const appointment = (await query(checkQuery, [req.params.appointmentId, req.user.id]))[0];

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found or unauthorized'
      });
    }

    const result = await transaction(async (client) => {
      const updateQuery = `
        UPDATE appointments
        SET status = $1, notes = $2
        WHERE id = $3
        RETURNING *
      `;
      const updatedAppointment = (await client.query(updateQuery, [status, notes, req.params.appointmentId])).rows[0];

      if (status === 'cancelled') {
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
      }

      return updatedAppointment;
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};

export const getAppointmentsWithFilters = async (req, res) => {
  try {
    const { doctorId, patientId, date, status } = req.query;
    
    let sql = `
      SELECT 
        a.*,
        json_build_object(
          'id', p.id,
          'diagnosis', p.diagnosis,
          'medications', p.medications,
          'instructions', p.instructions,
          'followUpDate', p.follow_up_date,
          'createdAt', p.created_at,
          'updatedAt', p.updated_at
        ) as prescription,
        json_build_object(
          'id', pat.id,
          'dateOfBirth', pat.date_of_birth,
          'gender', pat.gender,
          'bloodGroup', pat.blood_group,
          'address', pat.address,
          'user', json_build_object(
            'id', pu.id,
            'firstName', pu.first_name,
            'lastName', pu.last_name,
            'email', pu.email,
            'phone', pu.phone
          )
        ) as patient,
        json_build_object(
          'id', d.id,
          'specialization', d.specialization,
          'qualifications', d.qualifications,
          'experience', d.experience,
          'consultationFee', d.consultation_fee,
          'user', json_build_object(
            'id', du.id,
            'firstName', du.first_name,
            'lastName', du.last_name,
            'email', du.email,
            'phone', du.phone
          )
        ) as doctor
      FROM appointments a
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      LEFT JOIN patients pat ON a.patient_id = pat.id
      LEFT JOIN users pu ON pat.user_id = pu.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (doctorId) {
      sql += ` AND a.doctor_id = $${paramCount}`;
      values.push(doctorId);
      paramCount++;
    }

    if (patientId) {
      sql += ` AND a.patient_id = $${paramCount}`;
      values.push(patientId);
      paramCount++;
    }

    if (date) {
      sql += ` AND DATE(a.appointment_date) = $${paramCount}`;
      values.push(date);
      paramCount++;
    }

    if (status) {
      sql += ` AND a.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    sql += ' ORDER BY a.appointment_date ASC, a.start_time ASC';

    const appointments = await query(sql, values);
    res.json(appointments);
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      error: 'Error getting appointments'
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        a.*,
        json_build_object(
          'id', p.id,
          'diagnosis', p.diagnosis,
          'medications', p.medications,
          'instructions', p.instructions,
          'followUpDate', p.follow_up_date,
          'createdAt', p.created_at,
          'updatedAt', p.updated_at
        ) as prescription,
        json_build_object(
          'id', pat.id,
          'dateOfBirth', pat.date_of_birth,
          'gender', pat.gender,
          'bloodGroup', pat.blood_group,
          'address', pat.address,
          'user', json_build_object(
            'id', pu.id,
            'firstName', pu.first_name,
            'lastName', pu.last_name,
            'email', pu.email,
            'phone', pu.phone
          )
        ) as patient,
        json_build_object(
          'id', d.id,
          'specialization', d.specialization,
          'qualifications', d.qualifications,
          'experience', d.experience,
          'consultationFee', d.consultation_fee,
          'user', json_build_object(
            'id', du.id,
            'firstName', du.first_name,
            'lastName', du.last_name,
            'email', du.email,
            'phone', du.phone
          )
        ) as doctor
      FROM appointments a
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      LEFT JOIN patients pat ON a.patient_id = pat.id
      LEFT JOIN users pu ON pat.user_id = pu.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE a.id = $1
    `;

    const appointment = await query(sql, [id]);
    
    if (!appointment[0]) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    res.json(appointment[0]);
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      error: 'Error getting appointment'
    });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { diagnosis, medications, followUpDate } = req.body;

    const appointment = await query(
      'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2',
      [appointmentId, req.user.profile.id]
    );

    if (!appointment[0]) {
      return res.status(404).json({
        error: 'Appointment not found or unauthorized'
      });
    }

    const existingPrescription = await query(
      'SELECT * FROM prescriptions WHERE appointment_id = $1',
      [appointmentId]
    );

    if (existingPrescription[0]) {
      return res.status(400).json({
        error: 'Prescription already exists for this appointment'
      });
    }

    const result = await transaction(async (client) => {
      const prescription = (await client.query(
        `
        INSERT INTO prescriptions (appointment_id, diagnosis, medications, follow_up_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [appointmentId, diagnosis, medications, followUpDate]
      )).rows[0];

      await client.query(
        'UPDATE appointments SET status = $1 WHERE id = $2',
        ['completed', appointmentId]
      );

      const updatedAppointment = (await client.query(
        `
        SELECT 
          a.*,
          json_build_object(
            'id', p.id,
            'diagnosis', p.diagnosis,
            'medications', p.medications,
            'followUpDate', p.follow_up_date,
            'createdAt', p.created_at,
            'updatedAt', p.updated_at
          ) as prescription,
          json_build_object(
            'id', pat.id,
            'dateOfBirth', pat.date_of_birth,
            'gender', pat.gender,
            'bloodGroup', pat.blood_group,
            'address', pat.address,
            'user', json_build_object(
              'id', pu.id,
              'firstName', pu.first_name,
              'lastName', pu.last_name,
              'email', pu.email,
              'phone', pu.phone
            )
          ) as patient,
          json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'user', json_build_object(
              'id', du.id,
              'firstName', du.first_name,
              'lastName', du.last_name,
              'email', du.email,
              'phone', du.phone
            )
          ) as doctor
        FROM appointments a
        LEFT JOIN prescriptions p ON a.id = p.appointment_id
        LEFT JOIN patients pat ON a.patient_id = pat.id
        LEFT JOIN users pu ON pat.user_id = pu.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users du ON d.user_id = du.id
        WHERE a.id = $1
        `,
        [appointmentId]
      )).rows[0];

      return updatedAppointment;
    });

    res.json(result);
  } catch (error) {
    console.error('Error adding prescription:', error);
    res.status(500).json({
      error: 'Error adding prescription'
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { diagnosis, medications, instructions, followUpDate } = req.body;

    const appointment = await query(
      'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2',
      [appointmentId, req.user.profile.id]
    );

    if (!appointment[0]) {
      return res.status(404).json({
        error: 'Appointment not found or unauthorized'
      });
    }

    const prescription = await query(
      'SELECT * FROM prescriptions WHERE appointment_id = $1',
      [appointmentId]
    );

    if (!prescription[0]) {
      return res.status(404).json({
        error: 'Prescription not found'
      });
    }

    const result = await transaction(async (client) => {
      await client.query(
        `
        UPDATE prescriptions 
        SET diagnosis = $1, medications = $2, instructions = $3, follow_up_date = $4, updated_at = NOW()
        WHERE appointment_id = $5
        `,
        [diagnosis, medications, instructions, followUpDate, appointmentId]
      );

      const updatedAppointment = (await client.query(
        `
        SELECT 
          a.*,
          json_build_object(
            'id', p.id,
            'diagnosis', p.diagnosis,
            'medications', p.medications,
            'instructions', p.instructions,
            'followUpDate', p.follow_up_date,
            'createdAt', p.created_at,
            'updatedAt', p.updated_at
          ) as prescription,
          json_build_object(
            'id', pat.id,
            'dateOfBirth', pat.date_of_birth,
            'gender', pat.gender,
            'bloodGroup', pat.blood_group,
            'address', pat.address,
            'user', json_build_object(
              'id', pu.id,
              'firstName', pu.first_name,
              'lastName', pu.last_name,
              'email', pu.email,
              'phone', pu.phone
            )
          ) as patient,
          json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'user', json_build_object(
              'id', du.id,
              'firstName', du.first_name,
              'lastName', du.last_name,
              'email', du.email,
              'phone', du.phone
            )
          ) as doctor
        FROM appointments a
        LEFT JOIN prescriptions p ON a.id = p.appointment_id
        LEFT JOIN patients pat ON a.patient_id = pat.id
        LEFT JOIN users pu ON pat.user_id = pu.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users du ON d.user_id = du.id
        WHERE a.id = $1
        `,
        [appointmentId]
      )).rows[0];

      return updatedAppointment;
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      error: 'Error updating prescription'
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, type, reason } = req.body;

    const doctor = await query('SELECT * FROM doctors WHERE id = $1', [doctorId]);
    if (!doctor[0]) {
      return res.status(404).json({
        error: 'Doctor not found'
      });
    }

    const patient = await query('SELECT * FROM patients WHERE user_id = $1', [req.user.id]);
    if (!patient[0]) {
      return res.status(404).json({
        error: 'Patient profile not found'
      });
    }

    const conflictingAppointment = await query(
      `SELECT * FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
      [doctorId, appointmentDate, startTime, endTime]
    );

    if (conflictingAppointment[0]) {
      return res.status(400).json({
        error: 'This time slot is not available'
      });
    }

    const result = await transaction(async (client) => {
      const appointmentQuery = `
        INSERT INTO appointments (
          doctor_id, 
          patient_id, 
          appointment_date, 
          start_time, 
          end_time, 
          type, 
          reason, 
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const appointment = (await client.query(appointmentQuery, [
        doctorId,
        patient[0].id,
        appointmentDate,
        startTime,
        endTime,
        type,
        reason,
        'scheduled'
      ])).rows[0];

      const fullAppointmentQuery = `
        SELECT 
          a.*,
          json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'user', json_build_object(
              'id', du.id,
              'firstName', du.first_name,
              'lastName', du.last_name,
              'email', du.email,
              'phone', du.phone
            )
          ) as doctor,
          json_build_object(
            'id', p.id,
            'dateOfBirth', p.date_of_birth,
            'gender', p.gender,
            'bloodGroup', p.blood_group,
            'user', json_build_object(
              'id', pu.id,
              'firstName', pu.first_name,
              'lastName', pu.last_name,
              'email', pu.email,
              'phone', pu.phone
            )
          ) as patient
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        WHERE a.id = $1
      `;

      const fullAppointment = (await client.query(fullAppointmentQuery, [appointment.id])).rows[0];
      return fullAppointment;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      error: 'Error creating appointment'
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, startTime, endTime, type, reason, status } = req.body;

    const existingAppointment = await query(
      `SELECT a.*, 
        CASE 
          WHEN $1 = 'doctor' THEN d.user_id 
          WHEN $1 = 'patient' THEN p.user_id 
        END as user_id
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $2`,
      [req.user.role, id]
    );

    if (!existingAppointment[0]) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    if (existingAppointment[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to update this appointment'
      });
    }

    if (appointmentDate && startTime && endTime) {
      const conflictingAppointment = await query(
        `SELECT * FROM appointments 
         WHERE doctor_id = $1 
         AND appointment_date = $2 
         AND id != $3
         AND (
           (start_time <= $4 AND end_time > $4) OR
           (start_time < $5 AND end_time >= $5) OR
           (start_time >= $4 AND end_time <= $5)
         )`,
        [
          existingAppointment[0].doctor_id,
          appointmentDate,
          id,
          startTime,
          endTime
        ]
      );

      if (conflictingAppointment[0]) {
        return res.status(400).json({
          error: 'This time slot is not available'
        });
      }
    }

    const result = await transaction(async (client) => {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (appointmentDate) {
        updates.push(`appointment_date = $${paramCount}`);
        values.push(appointmentDate);
        paramCount++;
      }
      if (startTime) {
        updates.push(`start_time = $${paramCount}`);
        values.push(startTime);
        paramCount++;
      }
      if (endTime) {
        updates.push(`end_time = $${paramCount}`);
        values.push(endTime);
        paramCount++;
      }
      if (type) {
        updates.push(`type = $${paramCount}`);
        values.push(type);
        paramCount++;
      }
      if (reason) {
        updates.push(`reason = $${paramCount}`);
        values.push(reason);
        paramCount++;
      }
      if (status && req.user.role === 'doctor') {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      updates.push(`updated_at = NOW()`);

      values.push(id);

      const updateQuery = `
        UPDATE appointments
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const updatedAppointment = (await client.query(updateQuery, values)).rows[0];

      const fullAppointmentQuery = `
        SELECT 
          a.*,
          json_build_object(
            'id', d.id,
            'specialization', d.specialization,
            'qualifications', d.qualifications,
            'experience', d.experience,
            'consultationFee', d.consultation_fee,
            'user', json_build_object(
              'id', du.id,
              'firstName', du.first_name,
              'lastName', du.last_name,
              'email', du.email,
              'phone', du.phone
            )
          ) as doctor,
          json_build_object(
            'id', p.id,
            'dateOfBirth', p.date_of_birth,
            'gender', p.gender,
            'bloodGroup', p.blood_group,
            'user', json_build_object(
              'id', pu.id,
              'firstName', pu.first_name,
              'lastName', pu.last_name,
              'email', pu.email,
              'phone', pu.phone
            )
          ) as patient
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        WHERE a.id = $1
      `;

      const fullAppointment = (await client.query(fullAppointmentQuery, [id])).rows[0];
      return fullAppointment;
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      error: 'Error updating appointment'
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await query(
      `SELECT a.*, 
        CASE 
          WHEN $1 = 'doctor' THEN d.user_id 
          WHEN $1 = 'patient' THEN p.user_id 
        END as user_id
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $2`,
      [req.user.role, id]
    );

    if (!appointment[0]) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    if (appointment[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to delete this appointment'
      });
    }

    const appointmentDate = new Date(appointment[0].appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        error: 'Cannot delete past appointments'
      });
    }

    await query('DELETE FROM appointments WHERE id = $1', [id]);

    res.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      error: 'Error deleting appointment'
    });
  }
}; 