const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  // Sensitive fields - will be masked in database
  name_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hashed version of user name for security'
  },
  dob_encrypted: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Encrypted date of birth'
  },
  mobile_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hashed mobile number'
  },
  // Non-sensitive fields
  gender: {
    type: DataTypes.ENUM('M', 'F', 'Other'),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['name_hash']
    },
    {
      fields: ['mobile_hash']
    }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Remove sensitive data from JSON output
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.name_hash;
  delete values.dob_encrypted;
  delete values.mobile_hash;
  return values;
};

module.exports = User;
