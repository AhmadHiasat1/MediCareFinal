import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'medicare_db',
  user: 'postgres',
  password: '0000',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error.stack);
    throw error;
  }
};

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to database');
    release();
  }
}); 