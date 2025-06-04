import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await query(sql);
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

export default runMigrations; 