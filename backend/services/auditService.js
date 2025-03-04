const AuditLog = require('../models/AuditLog');

/**
 * Service pour gérer les logs d'audit
 */
class AuditService {
  /**
   * Crée un nouveau log d'audit
   * @param {string} action - L'action effectuée
   * @param {number} userId - L'ID de l'utilisateur ayant effectué l'action
   * @param {string} userName - Le nom de l'utilisateur ayant effectué l'action
   * @param {Object} details - Détails supplémentaires sur l'action
   * @param {string} ip - Adresse IP de l'utilisateur
   * @returns {Promise<AuditLog>} Le log d'audit créé
   */
  static async createLog(action, userId, userName, details = {}, ip = null) {
    try {
      const log = new AuditLog({
        action,
        userId,
        userName,
        details,
        ip
      });
      
      await log.save();
      return log;
    } catch (error) {
      console.error('Erreur lors de la création du log d\'audit:', error);
      // Ne pas planter le processus si l'enregistrement du log échoue
      return null;
    }
  }

  /**
   * Récupère les logs d'audit avec filtres
   * @param {Object} filters - Filtres (userId, action, startDate, endDate)
   * @param {number} page - Numéro de page
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<{logs: AuditLog[], total: number, pages: number}>}
   */
  static async getLogs(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};
      
      if (filters.userId) query.userId = filters.userId;
      if (filters.action) query.action = filters.action;
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
      }
      
      const skip = (page - 1) * limit;
      
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(query)
      ]);
      
      return {
        logs,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des logs d\'audit:', error);
      throw error;
    }
  }
}

module.exports = AuditService;