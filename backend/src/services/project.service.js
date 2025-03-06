const Project = require('../models/sql/project.model');
const User = require('../models/sql/user.model');
const Team = require('../models/sql/team.model');
const { AppError } = require('../utils/error.utils');
const { roles } = require('../config/auth');

/**
 * Service pour la gestion des projets
 */
class ProjectService {
  /**
   * Créer un nouveau projet
   * @param {Object} projectData - Données du projet
   * @param {string} userId - ID de l'utilisateur créant le projet
   * @returns {Object} Projet créé
   */
  async createProject(projectData, userId) {
    const { name, description, team_id } = projectData;

    // Vérifier que l'utilisateur est un chef de projet ou un administrateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (user.role !== roles.PROJECT_MANAGER && user.role !== roles.ADMIN) {
      throw new AppError('Seuls les chefs de projet peuvent créer des projets', 403);
    }

    // Vérifier que l'équipe existe
    const team = await Team.findByPk(team_id);
    if (!team) {
      throw new AppError('Équipe non trouvée', 404);
    }

    // Vérifier que l'utilisateur est le chef de l'équipe ou un administrateur
    if (user.role !== roles.ADMIN && team.manager_id !== userId) {
      throw new AppError('Vous ne pouvez créer des projets que pour votre équipe', 403);
    }

    // Créer le projet
    const project = await Project.create({
      name,
      description,
      team_id,
      created_by: userId,
      status: 'active'
    });

    return project;
  }

  /**
   * Mettre à jour un projet
   * @param {string} projectId - ID du projet
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
   * @returns {Object} Projet mis à jour
   */
  async updateProject(projectId, updateData, userId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new AppError('Projet non trouvé', 404);
    }

    // Vérifier que l'utilisateur est le créateur du projet ou un administrateur
    const user = await User.findByPk(userId);
    if (project.created_by !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de modifier ce projet', 403);
    }

    // Mettre à jour le projet
    await project.update(updateData);

    return project;
  }

  /**
   * Supprimer un projet
   * @param {string} projectId - ID du projet
   * @param {string} userId - ID de l'utilisateur effectuant la suppression
   * @returns {Object} Message de succès
   */
  async deleteProject(projectId, userId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new AppError('Projet non trouvé', 404);
    }

    // Vérifier que l'utilisateur est le créateur du projet ou un administrateur
    const user = await User.findByPk(userId);
    if (project.created_by !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de supprimer ce projet', 403);
    }

    // Supprimer le projet
    await project.destroy();

    return { message: 'Projet supprimé avec succès' };
  }

  /**
   * Récupérer les détails d'un projet
   * @param {string} projectId - ID du projet
   * @returns {Object} Détails du projet
   */
  async getProjectDetails(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new AppError('Projet non trouvé', 404);
    }

    // Récupérer l'équipe associée
    const team = await Team.findByPk(project.team_id, {
      attributes: ['id', 'name', 'manager_id']
    });

    // Récupérer le créateur
    const creator = await User.findByPk(project.created_by, {
      attributes: ['id', 'name', 'email', 'role']
    });

    return {
      ...project.toJSON(),
      team,
      creator
    };
  }

  /**
   * Récupérer tous les projets d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Array} Liste des projets
   */
  async getUserProjects(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    let projects;

    // Si l'utilisateur est un administrateur, récupérer tous les projets
    if (user.role === roles.ADMIN) {
      projects = await Project.findAll({
        order: [['createdAt', 'DESC']]
      });
    } 
    // Si l'utilisateur est un chef de projet, récupérer les projets de son équipe
    else if (user.role === roles.PROJECT_MANAGER) {
      projects = await Project.findAll({
        where: { team_id: user.team_id },
        order: [['createdAt', 'DESC']]
      });
    } 
    // Si l'utilisateur est un contributeur, récupérer les projets de son équipe
    else {
      projects = await Project.findAll({
        where: { team_id: user.team_id },
        order: [['createdAt', 'DESC']]
      });
    }

    return projects;
  }

  /**
   * Récupérer les projets par équipe
   * @param {string} teamId - ID de l'équipe
   * @param {Object} options - Options de pagination
   * @returns {Object} Liste des projets
   */
  async getTeamProjects(teamId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where: { team_id: teamId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      projects: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Archiver un projet
   * @param {string} projectId - ID du projet
   * @param {string} userId - ID de l'utilisateur effectuant l'archivage
   * @returns {Object} Projet mis à jour
   */
  async archiveProject(projectId, userId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new AppError('Projet non trouvé', 404);
    }

    // Vérifier que l'utilisateur est le créateur du projet ou un administrateur
    const user = await User.findByPk(userId);
    if (project.created_by !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation d\'archiver ce projet', 403);
    }

    // Mettre à jour le statut du projet
    await project.update({ status: 'archived' });

    return project;
  }
}

module.exports = new ProjectService();