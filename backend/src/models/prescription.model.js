import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Doctor } from './doctor.model.js';
import { Patient } from './patient.model.js';

export const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

Prescription.belongsTo(Doctor, { foreignKey: 'doctorId' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId' });

export default Prescription; 
import { sequelize } from '../config/database.js';
import { Doctor } from './doctor.model.js';
import { Patient } from './patient.model.js';

export const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

Prescription.belongsTo(Doctor, { foreignKey: 'doctorId' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId' });

export default Prescription; 
 
 
 