const User = require('../models/sql/user.model');
const Team = require('../models/sql/team.model');
const Project = require('../models/sql/project.model');
const Task = require('../models/sql/task.model');
const { roles } = require('../config/auth');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * Service pour les statistiques et métriques
 */
class StatsService {
  /**
   * Obtenir les statistiques globales pour le tableau de bord admin
   * @returns {Object} Statistiques globales
   */
  async getGlobalStats() {
    // Nombre d'utilisateurs par rôle
    const userStats = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Convertir en format plus facile à utiliser
    const userCounts = {
      total: 0,
      admin: 0,
      project_manager: 0,
      contributor: 0
    };

    userStats.forEach(stat => {
      const { role, count } = stat.dataValues;
      userCounts[role] = parseInt(count, 10);
      userCounts.total += parseInt(count, 10);
    });

    // Nombre total d'équipes
    const teamCount = await Team.count();

    // Nombre de projets par statut
    const projectStats = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const projectCounts = {
      total: 0,
      active: 0,
      archived: 0
    };

    projectStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      projectCounts[status] = parseInt(count, 10);
      projectCounts.total += parseInt(count, 10);
    });

    // Nombre de tâches par statut
    const taskStats = await Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const taskCounts = {
      total: 0,
      todo: 0,
      in_progress: 0,
      done: 0
    };

    taskStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      taskCounts[status] = parseInt(count, 10);
      taskCounts.total += parseInt(count, 10);
    });

    // Activité récente (création de projets, équipes)
    const recentActivity = {
      // Derniers projets créés
      recentProjects: await Project.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'status', 'createdAt']
      }),
      
      // Dernières équipes créées
      recentTeams: await Team.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'createdAt']
      }),
      
      // Derniers utilisateurs inscrits
      recentUsers: await User.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      })
    };

    return {
      users: userCounts,
      teams: {
        total: teamCount
      },
      projects: projectCounts,
      tasks: taskCounts,
      recentActivity
    };
  }

  /**
   * Obtenir les statistiques pour un chef de projet
   * @param {string} userId - ID du chef de projet
   * @returns {Object} Statistiques du chef de projet
   */
  async getProjectManagerStats(userId) {
    // Récupérer l'équipe du chef de projet
    const user = await User.findByPk(userId);
    if (!user || user.role !== roles.PROJECT_MANAGER) {
      return null;
    }

    // Obtenir l'ID de l'équipe
    const teamId = user.team_id;

    // Nombre de membres dans l'équipe
    const teamMemberCount = await User.count({
      where: { team_id: teamId }
    });

    // Nombre de projets de l'équipe par statut
    const projectStats = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { team_id: teamId },
      group: ['status']
    });

    const projectCounts = {
      total: 0,
      active: 0,
      archived: 0
    };

    projectStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      projectCounts[status] = parseInt(count, 10);
      projectCounts.total += parseInt(count, 10);
    });

    // Projets de l'équipe
    const teamProjects = await Project.findAll({
      where: { team_id: teamId },
      attributes: ['id']
    });

    const projectIds = teamProjects.map(project => project.id);

    // Nombre de tâches des projets de l'équipe par statut
    let taskStats = [];
    if (projectIds.length > 0) {
      taskStats = await Task.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { 
          project_id: { [Op.in]: projectIds }
        },
        group: ['status']
      });
    }

    const taskCounts = {
      total: 0,
      todo: 0,
      in_progress: 0,
      done: 0
    };

    taskStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      taskCounts[status] = parseInt(count, 10);
      taskCounts.total += parseInt(count, 10);
    });

    // Top contributeurs par nombre de tâches complétées
    let topContributors = [];
    if (projectIds.length > 0) {
      topContributors = await Task.findAll({
        attributes: [
          'assigned_to',
          [sequelize.fn('COUNT', sequelize.col('id')), 'taskCount']
        ],
        where: { 
          project_id: { [Op.in]: projectIds },
          status: 'done'
        },
        group: ['assigned_to'],
        order: [[sequelize.literal('taskCount'), 'DESC']],
        limit: 5,
        include: [{
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }]
      });
    }

    return {
      team: {
        id: teamId,
        memberCount: teamMemberCount
      },
      projects: projectCounts,
      tasks: taskCounts,
      topContributors: topContributors.map(c => ({
        user: c.assignee,
        completedTasks: parseInt(c.dataValues.taskCount, 10)
      }))
    };
  }

  /**
   * Obtenir les statistiques pour un utilisateur contributeur
   * @param {string} userId - ID du contributeur
   * @returns {Object} Statistiques du contributeur
   */
  async getContributorStats(userId) {
    // Statistiques des tâches de l'utilisateur par statut
    const taskStats = await Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { assigned_to: userId },
      group: ['status']
    });

    const taskCounts = {
      total: 0,
      todo: 0,
      in_progress: 0,
      done: 0
    };

    taskStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      taskCounts[status] = parseInt(count, 10);
      taskCounts.total += parseInt(count, 10);
    });

    // Tâches à faire et en retard
    const today = new Date();
    const todoTasks = await Task.findAll({
      where: { 
        assigned_to: userId,
        status: 'todo'
      },
      order: [['deadline', 'ASC']],
      limit: 5,
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name']
      }]
    });

    const overdueTasks = await Task.findAll({
      where: {
        assigned_to: userId,
        status: { [Op.ne]: 'done' },
        deadline: { [Op.lt]: today }
      },
      order: [['deadline', 'ASC']],
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name']
      }]
    });

    // Récupérer les informations sur les projets auxquels l'utilisateur participe
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // Obtenir les projets de l'équipe de l'utilisateur
    const userProjects = await Project.findAll({
      where: { team_id: user.team_id },
      attributes: ['id', 'name', 'status']
    });

    return {
      tasks: taskCounts,
      todoTasks,
      overdueTasks,
      projects: userProjects
    };
  }

  /**
   * Obtenir des statistiques pour un projet spécifique
   * @param {string} projectId - ID du projet
   * @returns {Object} Statistiques du projet
   */
  async getProjectStats(projectId) {
    // Récupérer le projet
    const project = await Project.findByPk(projectId);
    if (!project) {
      return null;
    }

    // Nombre de tâches par statut
    const taskStats = await Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { project_id: projectId },
      group: ['status']
    });

    const taskCounts = {
      total: 0,
      todo: 0,
      in_progress: 0,
      done: 0
    };

    taskStats.forEach(stat => {
      const { status, count } = stat.dataValues;
      taskCounts[status] = parseInt(count, 10);
      taskCounts.total += parseInt(count, 10);
    });

    // Calculer le taux de complétion
    const completionRate = taskCounts.total > 0 
      ? (taskCounts.done / taskCounts.total) * 100 
      : 0;

    // Nombre de tâches par utilisateur
    const userTaskStats = await Task.findAll({
      attributes: [
        'assigned_to',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { project_id: projectId },
      group: ['assigned_to'],
      include: [{
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email']
      }]
    });

    // Tâches en retard
    const today = new Date();
    const overdueTasks = await Task.count({
      where: {
        project_id: projectId,
        status: { [Op.ne]: 'done' },
        deadline: { [Op.lt]: today }
      }
    });

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        createdAt: project.createdAt
      },
      tasks: taskCounts,
      completionRate: parseFloat(completionRate.toFixed(2)),
      userTaskDistribution: userTaskStats.map(stat => ({
        user: stat.assignee,
        taskCount: parseInt(stat.dataValues.count, 10)
      })),
      overdueTasks
    };
  }
}

module.exports = new StatsService();