const Team = require('../models/sql/team.model');
const User = require('../models/sql/user.model');
const { AppError } = require('../utils/error.utils');
const { roles } = require('../config/auth');
const crypto = require('crypto');

/**
 * Service pour la gestion des équipes
 */
class TeamService {
  /**
   * Créer une nouvelle équipe
   * @param {Object} teamData - Données de l'équipe
   * @param {string} managerId - ID du chef de projet
   * @returns {Object} Équipe créée
   */
  async createTeam(teamData, managerId) {
    const { name, description } = teamData;

    // Vérifier si l'utilisateur est bien un chef de projet
    const manager = await User.findByPk(managerId);
    if (!manager || manager.role !== roles.PROJECT_MANAGER) {
      throw new AppError('Seuls les chefs de projet peuvent créer une équipe', 403);
    }

    // Vérifier si le chef de projet a déjà une équipe
    const existingTeam = await Team.findOne({ where: { manager_id: managerId } });
    if (existingTeam) {
      throw new AppError('Vous avez déjà une équipe. Un chef de projet ne peut avoir qu\'une seule équipe.', 400);
    }

    // Générer une clé d'invitation
    const invitationKey = crypto.randomBytes(16).toString('hex');

    // Créer l'équipe
    const team = await Team.create({
      name,
      description,
      manager_id: managerId,
      invitation_key: invitationKey
    });

    // Mettre à jour l'utilisateur avec l'ID de l'équipe
    await manager.update({ team_id: team.id });

    return team;
  }

  /**
   * Mettre à jour une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
   * @returns {Object} Équipe mise à jour
   */
  async updateTeam(teamId, updateData, userId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new AppError('Équipe non trouvée', 404);
    }

    // Vérifier que l'utilisateur est le chef de l'équipe ou un administrateur
    const user = await User.findByPk(userId);
    if (team.manager_id !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de modifier cette équipe', 403);
    }

    // Mettre à jour l'équipe
    await team.update(updateData);

    return team;
  }

  /**
   * Récupérer les détails d'une équipe
   * @param {string} teamId - ID de l'équipe
   * @returns {Object} Détails de l'équipe
   */
  async getTeamDetails(teamId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new AppError('Équipe non trouvée', 404);
    }

    // Récupérer les membres de l'équipe
    const members = await User.findAll({
      where: { team_id: teamId },
      attributes: ['id', 'name', 'email', 'role', 'last_login', 'createdAt']
    });

    return {
      ...team.toJSON(),
      members
    };
  }

  /**
   * Récupérer l'équipe d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Équipe de l'utilisateur
   */
  async getUserTeam(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (!user.team_id) {
      throw new AppError('L\'utilisateur n\'appartient à aucune équipe', 404);
    }

    return this.getTeamDetails(user.team_id);
  }

  /**
   * Générer une nouvelle clé d'invitation pour une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} userId - ID du chef de projet
   * @returns {Object} Nouvelle clé d'invitation
   */
  async regenerateInvitationKey(teamId, userId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new AppError('Équipe non trouvée', 404);
    }

    // Vérifier que l'utilisateur est le chef de l'équipe ou un administrateur
    const user = await User.findByPk(userId);
    if (team.manager_id !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de régénérer la clé d\'invitation', 403);
    }

    // Générer une nouvelle clé
    const newInvitationKey = crypto.randomBytes(16).toString('hex');
    await team.update({ invitation_key: newInvitationKey });

    return {
      invitation_key: newInvitationKey
    };
  }

  /**
   * Supprimer un membre d'une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} memberId - ID du membre à supprimer
   * @param {string} requesterId - ID de l'utilisateur effectuant la demande
   * @returns {Object} Message de succès
   */
  async removeMember(teamId, memberId, requesterId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new AppError('Équipe non trouvée', 404);
    }

    // Vérifier que l'utilisateur est le chef de l'équipe ou un administrateur
    const requester = await User.findByPk(requesterId);
    if (team.manager_id !== requesterId && requester.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de supprimer des membres', 403);
    }

    // Vérifier que le membre existe et appartient à l'équipe
    const member = await User.findByPk(memberId);
    if (!member) {
      throw new AppError('Membre non trouvé', 404);
    }

    if (member.team_id !== teamId) {
      throw new AppError('Cet utilisateur n\'appartient pas à cette équipe', 400);
    }

    // Ne pas permettre de supprimer le chef de projet
    if (member.id === team.manager_id) {
      throw new AppError('Impossible de supprimer le chef de projet de son équipe', 400);
    }

    // Mettre à jour l'utilisateur pour le retirer de l'équipe
    await member.update({ team_id: null });

    return { message: 'Membre supprimé de l\'équipe avec succès' };
  }

  /**
   * Lister toutes les équipes (admin uniquement)
   * @param {Object} options - Options de pagination
   * @returns {Object} Liste des équipes
   */
  async getAllTeams(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await Team.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      teams: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = new TeamService();