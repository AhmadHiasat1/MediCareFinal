import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', patientRoutes);
app.use('/api', doctorRoutes);
app.use('/api', prescriptionRoutes);

export default app; 
 
 
 
 