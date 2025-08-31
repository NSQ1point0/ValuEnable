const { sequelize } = require('../config/database');
const User = require('./User');
const Policy = require('./Policy');
const Illustration = require('./Illustration');

// Define associations
User.hasMany(Policy, { foreignKey: 'user_id', as: 'policies' });
Policy.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Policy.hasMany(Illustration, { foreignKey: 'policy_id', as: 'illustrations' });
Illustration.belongsTo(Policy, { foreignKey: 'policy_id', as: 'policy' });

// Initialize database
const initializeDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: false });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Policy,
  Illustration,
  initializeDatabase
};
