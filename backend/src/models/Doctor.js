import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

class Doctor extends Model {}

Doctor.init({
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qualifications: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  availableDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  workingHours: {
    type: DataTypes.JSON,
    defaultValue: {
      start: '09:00',
      end: '17:00'
    }
  },
  about: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Doctor'
});

// Associations
Doctor.belongsTo(User, { foreignKey: 'userId' });

export default Doctor; 