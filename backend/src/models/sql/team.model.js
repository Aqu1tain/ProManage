const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const crypto = require('crypto');

const Team = sequelize.define('team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  invitation_key: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => crypto.randomBytes(16).toString('hex')
  }
});

module.exports = Team;