const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');
const Comment = require('./Comment');
const { sequelize } = require('../config/db');
const AuditLog = require('./AuditLog');

// Définir les associations entre les modèles
const setupAssociations = () => {
  // Relations User & Project (via ProjectMember)
  User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId' });
  Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId' });
  
  // Relations Task
  Project.hasMany(Task, { foreignKey: 'projectId' });
  Task.belongsTo(Project, { foreignKey: 'projectId' });
  
  User.hasMany(Task, { foreignKey: 'assignedTo', as: 'AssignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'Assignee' });
  
  // Relations Comment
  Task.hasMany(Comment, { foreignKey: 'taskId' });
  Comment.belongsTo(Task, { foreignKey: 'taskId' });
  
  User.hasMany(Comment, { foreignKey: 'userId' });
  Comment.belongsTo(User, { foreignKey: 'userId' });
};

// Initialiser la base de données
const syncDatabase = async (force = false) => {
  setupAssociations();
  try {
    await sequelize.sync({ force });
    console.log('Base de données synchronisée');
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
    return false;
  }
};

module.exports = {
  User,
  Project,
  Task,
  ProjectMember,
  Comment,
  AuditLog,
  setupAssociations,
  syncDatabase
};