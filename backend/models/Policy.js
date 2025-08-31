const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Policy inputs
  sum_assured: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 500000, // Minimum 10 times sum assured or 500000
      max: 50000000
    }
  },
  modal_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 10000,
      max: 100000
    }
  },
  premium_frequency: {
    type: DataTypes.ENUM('Yearly', 'Half-Yearly', 'Monthly'),
    allowNull: false,
    defaultValue: 'Yearly'
  },
  policy_term: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 10,
      max: 20
    }
  },
  premium_paying_term: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 5,
      max: 10
    }
  },
  // Calculated fields
  annual_premium: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  calculated_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  policy_status: {
    type: DataTypes.ENUM('Draft', 'Active', 'Matured', 'Lapsed'),
    defaultValue: 'Draft'
  },
  // Metadata
  calculation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'policies',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['policy_status']
    },
    {
      fields: ['calculation_date']
    }
  ]
});

module.exports = Policy;
