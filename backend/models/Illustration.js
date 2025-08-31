const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Illustration = sequelize.define('Illustration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  policy_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'policies',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 50
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  premium_paid: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  cumulative_premium: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  guaranteed_addition: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  cumulative_guaranteed_addition: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_benefit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  surrender_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  death_benefit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'illustrations',
  indexes: [
    {
      unique: true,
      fields: ['policy_id', 'year']
    },
    {
      fields: ['policy_id']
    },
    {
      fields: ['year']
    }
  ]
});

module.exports = Illustration;
