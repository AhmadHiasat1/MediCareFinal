import { pool } from '../config/database.js';

const fixPrescriptionsTable = async () => {
  try {
    const client = await pool.connect();
    try {
      console.log('Fixing prescriptions table...');
      
      // Drop the existing prescriptions table if it exists
      await client.query('DROP TABLE IF EXISTS prescriptions CASCADE');
      
      // Create the prescriptions table with the correct schema
      await client.query(`
        CREATE TABLE prescriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
          diagnosis TEXT NOT NULL,
          medications TEXT NOT NULL,
          follow_up_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(appointment_id)
        )
      `);
      
      console.log('Prescriptions table fixed successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to fix prescriptions table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

fixPrescriptionsTable(); 