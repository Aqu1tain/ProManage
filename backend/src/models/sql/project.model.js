const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Project = sequelize.define('project', {
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
  team_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Project;