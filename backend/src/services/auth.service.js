const User = require('../models/sql/user.model');
const Team = require('../models/sql/team.model');
const { AppError } = require('../utils/error.utils');
const { generateToken, filterUserData } = require('../utils/helpers');
const { roles } = require('../config/auth');
const { sequelize } = require('../config/database');

/**
 * Service pour l'authentification et la gestion des utilisateurs
 */
class AuthService {
  /**
   * Inscription d'un chef de projet avec création d'équipe
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Object} Utilisateur créé et token
   */
  async registerProjectManager(userData) {
    const { name, email, password, team_name, description } = userData;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    // Utiliser une transaction pour assurer l'atomicité
    const transaction = await sequelize.transaction();

    try {
      // Créer l'équipe
      const team = await Team.create({
        name: team_name,
        description: description || `Équipe de ${name}`,
        manager_id: null // On le mettra à jour après avoir créé l'utilisateur
      }, { transaction });

      // Créer l'utilisateur
      const user = await User.create({
        name,
        email,
        password,
        role: roles.PROJECT_MANAGER,
        team_id: team.id
      }, { transaction });

      // Mettre à jour l'équipe avec l'ID du chef de projet
      await team.update({ manager_id: user.id }, { transaction });

      // Valider la transaction
      await transaction.commit();

      // Générer un token
      const token = generateToken(user);

      return {
        user: filterUserData(user),
        team,
        token
      };
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Inscription d'un contributeur avec clé d'invitation
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Object} Utilisateur créé et token
   */
  async registerContributor(userData) {
    const { name, email, password, invitation_key } = userData;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    // Trouver l'équipe correspondant à la clé d'invitation
    const team = await Team.findOne({ where: { invitation_key } });
    if (!team) {
      throw new AppError('Clé d\'invitation invalide', 400);
    }

    // Créer l'utilisateur contributeur
    const user = await User.create({
      name,
      email,
      password,
      role: roles.CONTRIBUTOR,
      team_id: team.id
    });

    // Générer un token
    const token = generateToken(user);

    return {
      user: filterUserData(user),
      team,
      token
    };
  }

  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - Identifiants de connexion
   * @returns {Object} Utilisateur et token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ last_login: new Date() });

    // Générer un token
    const token = generateToken(user);

    return {
      user: filterUserData(user),
      token
    };
  }

  /**
   * Récupérer le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Profil utilisateur
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Si l'utilisateur appartient à une équipe, récupérer les informations
    let teamData = null;
    if (user.team_id) {
      teamData = await Team.findByPk(user.team_id);
    }

    return {
      ...filterUserData(user),
      team: teamData
    };
  }

  /**
   * Mettre à jour le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Profil utilisateur mis à jour
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Ne pas permettre la mise à jour du rôle ou de l'équipe via cette méthode
    delete updateData.role;
    delete updateData.team_id;

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    return filterUserData(user);
  }

  /**
   * Changer le mot de passe d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} passwordData - Ancien et nouveau mot de passe
   * @returns {Object} Message de succès
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    // Mettre à jour avec le nouveau mot de passe
    await user.update({ password: newPassword });

    return { message: 'Mot de passe modifié avec succès' };
  }
}

module.exports = new AuthService();