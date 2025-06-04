import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Doctor from './Doctor.js';

class TimeSlot extends Model {}

TimeSlot.init({
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
  date: {
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
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringDay: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]
    }
  }
}, {
  sequelize,
  modelName: 'TimeSlot',
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'date', 'startTime']
    }
  ],
  validate: {
    timeOrder() {
      if (this.startTime >= this.endTime) {
        throw new Error('End time must be after start time');
      }
    }
  }
});

// Associations
TimeSlot.belongsTo(Doctor, { foreignKey: 'doctorId' });

export default TimeSlot; 