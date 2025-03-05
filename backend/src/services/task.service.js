const Task = require('../models/sql/task.model');
const User = require('../models/sql/user.model');
const Project = require('../models/sql/project.model');
const { AppError } = require('../utils/error.utils');
const { roles } = require('../config/auth');

/**
 * Service pour la gestion des tâches
 */
class TaskService {
  /**
   * Créer une nouvelle tâche
   * @param {Object} taskData - Données de la tâche
   * @param {string} userId - ID de l'utilisateur créant la tâche
   * @returns {Object} Tâche créée
   */
  async createTask(taskData, userId) {
    const { title, description, project_id, assigned_to, deadline, priority, tags } = taskData;

    // Vérifier que le projet existe
    const project = await Project.findByPk(project_id);
    if (!project) {
      throw new AppError('Projet non trouvé', 404);
    }

    // Vérifier les autorisations selon le rôle
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Si l'utilisateur est un contributeur, il ne peut créer des tâches que pour lui-même
    if (user.role === roles.CONTRIBUTOR) {
      // Si assigned_to est défini et différent de l'ID de l'utilisateur
      if (assigned_to && assigned_to !== userId) {
        throw new AppError('En tant que contributeur, vous ne pouvez créer des tâches que pour vous-même', 403);
      }
    }

    // Vérifier que l'utilisateur assigné existe et appartient à l'équipe du projet
    if (assigned_to) {
      const assignedUser = await User.findByPk(assigned_to);
      if (!assignedUser) {
        throw new AppError('Utilisateur assigné non trouvé', 404);
      }
      
      if (assignedUser.team_id !== project.team_id) {
        throw new AppError('L\'utilisateur assigné n\'appartient pas à l\'équipe du projet', 400);
      }
    }

    // Créer la tâche
    const task = await Task.create({
      title,
      description,
      project_id,
      assigned_to: assigned_to || userId, // Si non assigné, assigner à soi-même
      created_by: userId,
      status: 'todo',
      deadline,
      priority: priority || 'medium',
      tags: tags || []
    });

    return task;
  }

  /**
   * Mettre à jour une tâche
   * @param {string} taskId - ID de la tâche
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
   * @returns {Object} Tâche mise à jour
   */
  async updateTask(taskId, updateData, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier les autorisations selon le rôle
    if (user.role === roles.CONTRIBUTOR) {
      // Si le contributeur n'est pas le créateur ou l'assigné de la tâche
      if (task.created_by !== userId && task.assigned_to !== userId) {
        throw new AppError('Vous n\'avez pas l\'autorisation de modifier cette tâche', 403);
      }
      
      // Si le contributeur essaie de réassigner la tâche
      if (updateData.assigned_to && updateData.assigned_to !== task.assigned_to) {
        throw new AppError('En tant que contributeur, vous ne pouvez pas réassigner une tâche', 403);
      }
    }

    // Si assigned_to est mis à jour, vérifier que l'utilisateur existe et appartient à l'équipe
    if (updateData.assigned_to) {
      const assignedUser = await User.findByPk(updateData.assigned_to);
      if (!assignedUser) {
        throw new AppError('Utilisateur assigné non trouvé', 404);
      }
      
      const project = await Project.findByPk(task.project_id);
      if (assignedUser.team_id !== project.team_id) {
        throw new AppError('L\'utilisateur assigné n\'appartient pas à l\'équipe du projet', 400);
      }
    }

    // Mettre à jour la tâche
    await task.update(updateData);

    return task;
  }

  /**
   * Changer le statut d'une tâche
   * @param {string} taskId - ID de la tâche
   * @param {string} status - Nouveau statut
   * @param {string} userId - ID de l'utilisateur effectuant le changement
   * @returns {Object} Tâche mise à jour
   */
  async updateTaskStatus(taskId, status, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier les autorisations selon le rôle
    if (user.role === roles.CONTRIBUTOR) {
      // Si le contributeur n'est pas l'assigné de la tâche
      if (task.assigned_to !== userId) {
        throw new AppError('Vous n\'avez pas l\'autorisation de changer le statut de cette tâche', 403);
      }
    }

    // Mettre à jour le statut
    await task.update({ status });

    return task;
  }

  /**
   * Supprimer une tâche
   * @param {string} taskId - ID de la tâche
   * @param {string} userId - ID de l'utilisateur effectuant la suppression
   * @returns {Object} Message de succès
   */
  async deleteTask(taskId, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier les autorisations selon le rôle
    if (user.role === roles.CONTRIBUTOR) {
      // Si le contributeur n'est pas le créateur de la tâche
      if (task.created_by !== userId) {
        throw new AppError('Vous n\'avez pas l\'autorisation de supprimer cette tâche', 403);
      }
    } else if (user.role === roles.PROJECT_MANAGER) {
      // Vérifier que le chef de projet est responsable du projet
      const project = await Project.findByPk(task.project_id);
      if (project.created_by !== userId) {
        throw new AppError('Vous n\'avez pas l\'autorisation de supprimer cette tâche', 403);
      }
    }
    // Les administrateurs peuvent toujours supprimer

    // Supprimer la tâche
    await task.destroy();

    return { message: 'Tâche supprimée avec succès' };
  }

  /**
   * Récupérer les détails d'une tâche
   * @param {string} taskId - ID de la tâche
   * @returns {Object} Détails de la tâche
   */
  async getTaskDetails(taskId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    // Récupérer les informations sur le créateur et l'assigné
    const creator = await User.findByPk(task.created_by, {
      attributes: ['id', 'name', 'email', 'role']
    });

    let assignedTo = null;
    if (task.assigned_to) {
      assignedTo = await User.findByPk(task.assigned_to, {
        attributes: ['id', 'name', 'email', 'role']
      });
    }

    // Récupérer les informations sur le projet
    const project = await Project.findByPk(task.project_id, {
      attributes: ['id', 'name', 'team_id']
    });

    return {
      ...task.toJSON(),
      creator,
      assigned_to: assignedTo,
      project
    };
  }

  /**
   * Récupérer toutes les tâches d'un projet
   * @param {string} projectId - ID du projet
   * @param {Object} options - Options de filtrage et pagination
   * @returns {Object} Liste des tâches
   */
  async getProjectTasks(projectId, options = {}) {
    const { status, assigned_to, priority, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereConditions = { project_id: projectId };
    
    if (status) whereConditions.status = status;
    if (assigned_to) whereConditions.assigned_to = assigned_to;
    if (priority) whereConditions.priority = priority;

    const { count, rows } = await Task.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    });

    // Récupérer les informations sur les utilisateurs assignés pour chaque tâche
    const tasksWithUsers = await Promise.all(rows.map(async (task) => {
      let assignedUser = null;
      if (task.assigned_to) {
        assignedUser = await User.findByPk(task.assigned_to, {
          attributes: ['id', 'name', 'email', 'role']
        });
      }
      
      return {
        ...task.toJSON(),
        assigned_user: assignedUser
      };
    }));

    return {
      tasks: tasksWithUsers,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Récupérer toutes les tâches assignées à un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} options - Options de filtrage et pagination
   * @returns {Object} Liste des tâches
   */
  async getUserTasks(userId, options = {}) {
    const { status, project_id, priority, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereConditions = { assigned_to: userId };
    
    if (status) whereConditions.status = status;
    if (project_id) whereConditions.project_id = project_id;
    if (priority) whereConditions.priority = priority;

    const { count, rows } = await Task.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    });

    // Récupérer les informations sur les projets pour chaque tâche
    const tasksWithProjects = await Promise.all(rows.map(async (task) => {
      const project = await Project.findByPk(task.project_id, {
        attributes: ['id', 'name', 'team_id']
      });
      
      return {
        ...task.toJSON(),
        project
      };
    }));

    return {
      tasks: tasksWithProjects,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = new TaskService();