const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Comment = sequelize.define('comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Comment;