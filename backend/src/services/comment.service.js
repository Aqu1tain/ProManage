const Comment = require('../models/sql/comment.model');
const Task = require('../models/sql/task.model');
const User = require('../models/sql/user.model');
const Project = require('../models/sql/project.model');
const { AppError } = require('../utils/error.utils');
const { roles } = require('../config/auth');

/**
 * Service pour la gestion des commentaires
 */
class CommentService {
  /**
   * Créer un nouveau commentaire
   * @param {Object} commentData - Données du commentaire
   * @param {string} userId - ID de l'utilisateur créant le commentaire
   * @returns {Object} Commentaire créé
   */
  async createComment(commentData, userId) {
    const { content, task_id } = commentData;

    // Vérifier que la tâche existe
    const task = await Task.findByPk(task_id);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    // Vérifier que l'utilisateur a accès au projet associé à la tâche
    const project = await Project.findByPk(task.project_id);
    if (!project) {
      throw new AppError('Projet associé non trouvé', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier que l'utilisateur appartient à l'équipe du projet
    if (user.role !== roles.ADMIN && user.team_id !== project.team_id) {
      throw new AppError('Vous n\'avez pas accès à cette tâche', 403);
    }

    // Créer le commentaire
    const comment = await Comment.create({
      content,
      task_id,
      author_id: userId
    });

    return comment;
  }

  /**
   * Supprimer un commentaire
   * @param {string} commentId - ID du commentaire
   * @param {string} userId - ID de l'utilisateur effectuant la suppression
   * @returns {Object} Message de succès
   */
  async deleteComment(commentId, userId) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new AppError('Commentaire non trouvé', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Seul l'auteur du commentaire ou un admin peut le supprimer
    if (comment.author_id !== userId && user.role !== roles.ADMIN) {
      throw new AppError('Vous n\'avez pas l\'autorisation de supprimer ce commentaire', 403);
    }

    // Supprimer le commentaire
    await comment.destroy();

    return { message: 'Commentaire supprimé avec succès' };
  }

  /**
   * Récupérer tous les commentaires d'une tâche
   * @param {string} taskId - ID de la tâche
   * @param {Object} options - Options de pagination
   * @returns {Object} Liste des commentaires
   */
  async getTaskComments(taskId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Vérifier que la tâche existe
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new AppError('Tâche non trouvée', 404);
    }

    // Récupérer les commentaires avec pagination
    const { count, rows } = await Comment.findAndCountAll({
      where: { task_id: taskId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Récupérer les informations sur les auteurs
    const commentsWithAuthors = await Promise.all(rows.map(async (comment) => {
      const author = await User.findByPk(comment.author_id, {
        attributes: ['id', 'name', 'email', 'role']
      });
      
      return {
        ...comment.toJSON(),
        author
      };
    }));

    return {
      comments: commentsWithAuthors,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Mettre à jour un commentaire
   * @param {string} commentId - ID du commentaire
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} userId - ID de l'utilisateur effectuant la mise à jour
   * @returns {Object} Commentaire mis à jour
   */
  async updateComment(commentId, updateData, userId) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new AppError('Commentaire non trouvé', 404);
    }

    // Seul l'auteur du commentaire peut le modifier
    if (comment.author_id !== userId) {
      throw new AppError('Vous n\'avez pas l\'autorisation de modifier ce commentaire', 403);
    }

    // Mettre à jour le commentaire
    await comment.update({
      content: updateData.content
    });

    return comment;
  }
}

module.exports = new CommentService();