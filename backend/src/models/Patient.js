import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

class Patient extends Model {}

Patient.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  bloodGroup: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  emergencyContact: {
    type: DataTypes.STRING
  },
  medicalHistory: {
    type: DataTypes.TEXT
  },
  allergies: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Patient'
});

Patient.belongsTo(User, { foreignKey: 'userId' });

export default Patient; 