import { pool } from '../config/database.js';

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const findOne = async (text, params) => {
  const rows = await query(text, params);
  return rows[0];
};

export const findById = async (table, id) => {
  const text = `SELECT * FROM ${table} WHERE id = $1`;
  return findOne(text, [id]);
};

export const findByField = async (table, field, value) => {
  const text = `SELECT * FROM ${table} WHERE ${field} = $1`;
  return findOne(text, [value]);
};

export const create = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');
  
  const text = `
    INSERT INTO ${table} (${columns})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  return findOne(text, values);
};

export const update = async (table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  
  const text = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${values.length + 1}
    RETURNING *
  `;
  
  return findOne(text, [...values, id]);
};

export const remove = async (table, id) => {
  const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  return findOne(text, [id]);
}; 