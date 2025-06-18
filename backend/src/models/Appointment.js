import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Doctor from './Doctor.js';
import Patient from './Patient.js';

class Appointment extends Model {}

Appointment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Patient,
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  type: {
    type: DataTypes.ENUM('first-visit', 'follow-up', 'consultation'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  cancellationReason: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Appointment',
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'appointmentDate', 'startTime']
    }
  ]
});

Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

export default Appointment; 