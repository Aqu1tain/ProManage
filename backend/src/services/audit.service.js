const AuditLog = require('../models/nosql/audit.model');
const { AppError } = require('../utils/error.utils');

/**
 * Service pour la gestion des logs d'audit
 */
class AuditService {
  /**
   * Créer un nouveau log d'audit
   * @param {Object} logData - Données du log
   * @returns {Object} Log créé
   */
  async createLog(logData) {
    const { action, user, entity, details, ip } = logData;

    // Valider les données minimales requises
    if (!action || !user || !user.id || !entity || !entity.type) {
      throw new AppError('Données de log insuffisantes', 400);
    }

    // Créer le log
    const log = await AuditLog.create({
      action,
      user,
      entity,
      details,
      ip
    });

    return log;
  }

  /**
   * Récupérer les logs d'audit avec filtrage et pagination
   * @param {Object} filters - Filtres à appliquer
   * @param {Object} options - Options de pagination
   * @returns {Object} Logs d'audit
   */
  async getLogs(filters = {}, options = {}) {
    const { startDate, endDate, userId, entityType, entityId, action } = filters;
    const { page = 1, limit = 20 } = options;
    
    // Construire le filtre de requête
    const query = {};
    
    // Filtrer par plage de dates
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Filtrer par utilisateur
    if (userId) {
      query['user.id'] = userId;
    }
    
    // Filtrer par type d'entité
    if (entityType) {
      query['entity.type'] = entityType;
    }
    
    // Filtrer par ID d'entité
    if (entityId) {
      query['entity.id'] = entityId;
    }
    
    // Filtrer par action
    if (action) {
      query.action = action;
    }
    
    // Exécuter la requête avec pagination
    const total = await AuditLog.countDocuments(query);
    
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Récupérer les logs d'audit pour une entité spécifique
   * @param {string} entityType - Type d'entité
   * @param {string} entityId - ID de l'entité
   * @param {Object} options - Options de pagination
   * @returns {Object} Logs d'audit
   */
  async getEntityLogs(entityType, entityId, options = {}) {
    return this.getLogs(
      { entityType, entityId },
      options
    );
  }

  /**
   * Récupérer les logs d'audit pour un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} options - Options de pagination
   * @returns {Object} Logs d'audit
   */
  async getUserLogs(userId, options = {}) {
    return this.getLogs(
      { userId },
      options
    );
  }

  /**
   * Obtenir les statistiques des logs d'audit
   * @param {Object} filters - Filtres à appliquer
   * @returns {Object} Statistiques
   */
  async getAuditStats(filters = {}) {
    const { startDate, endDate } = filters;
    
    // Construire le filtre de requête
    const query = {};
    
    // Filtrer par plage de dates
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Agréger par type d'action
    const actionStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Agréger par type d'entité
    const entityStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: '$entity.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Agréger par utilisateur (top 10)
    const userStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: '$user.id', user: { $first: '$user' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return {
      actions: actionStats,
      entities: entityStats,
      users: userStats
    };
  }
}

module.exports = new AuditService();