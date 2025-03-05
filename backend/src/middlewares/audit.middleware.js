const AuditLog = require('../models/nosql/audit.model');
const logger = require('../config/logger');

/**
 * Middleware pour créer des logs d'audit
 * @param {string} action - L'action effectuée (ex: 'user.create', 'project.update')
 * @param {Object} options - Options supplémentaires pour le log
 * @returns {Function} Middleware Express
 */
exports.createAuditLog = (action, options = {}) => {
  return async (req, res, next) => {
    // Stocker la fonction originale res.json
    const originalJson = res.json;

    // Remplacer la fonction res.json par notre version augmentée
    res.json = function(data) {
      // Restaurer la fonction originale
      res.json = originalJson;

      // Appeler la fonction originale avec les données
      const result = res.json.call(this, data);

      // Si la requête a réussi (status 2xx), créer le log d'audit
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const entityType = options.entityType || inferEntityTypeFromUrl(req.originalUrl);
          
          // Préparer les données du log
          const logData = {
            action,
            user: {
              id: req.user.id,
              name: req.user.name,
              email: req.user.email,
              role: req.user.role
            },
            entity: {
              type: entityType,
              id: options.getEntityId ? options.getEntityId(req, data) : getEntityIdFromReq(req, data),
              name: options.getEntityName ? options.getEntityName(req, data) : getEntityNameFromReq(req, data)
            },
            details: options.getDetails ? options.getDetails(req, data) : getDefaultDetails(req, data),
            ip: req.ip || req.connection.remoteAddress
          };

          // Créer le log d'audit
          AuditLog.create(logData)
            .then(() => logger.debug(`Audit log created: ${action}`))
            .catch(err => logger.error(`Failed to create audit log: ${err.message}`));
        } catch (error) {
          logger.error(`Error creating audit log: ${error.message}`);
        }
      }

      return result;
    };

    next();
  };
};

// Fonctions utilitaires pour extraire les informations de la requête

// Deviner le type d'entité à partir de l'URL
function inferEntityTypeFromUrl(url) {
  const path = url.split('/');
  
  if (path.includes('users')) return 'user';
  if (path.includes('teams')) return 'team';
  if (path.includes('projects')) return 'project';
  if (path.includes('tasks')) return 'task';
  if (path.includes('comments')) return 'comment';
  
  return 'system';
}

// Obtenir l'ID de l'entité à partir de la requête ou des données de réponse
function getEntityIdFromReq(req, data) {
  // Essayer d'obtenir l'ID depuis les paramètres d'URL
  if (req.params.id) return req.params.id;
  
  // Essayer d'obtenir l'ID depuis le corps de la requête
  if (req.body.id) return req.body.id;
  
  // Essayer d'obtenir l'ID depuis les données de réponse
  if (data && data.id) return data.id;
  if (data && data.data && data.data.id) return data.data.id;
  
  return null;
}

// Obtenir le nom de l'entité à partir de la requête ou des données de réponse
function getEntityNameFromReq(req, data) {
  // Essayer d'obtenir le nom depuis le corps de la requête
  if (req.body.name) return req.body.name;
  if (req.body.title) return req.body.title;
  
  // Essayer d'obtenir le nom depuis les données de réponse
  if (data && data.name) return data.name;
  if (data && data.title) return data.title;
  if (data && data.data && data.data.name) return data.data.name;
  if (data && data.data && data.data.title) return data.data.title;
  
  return null;
}

// Obtenir les détails par défaut pour le log d'audit
function getDefaultDetails(req, data) {
  const details = {};
  
  // Ajouter les anciennes valeurs si disponibles (pour les mises à jour)
  if (req.oldData) {
    details.old = req.oldData;
  }
  
  // Ajouter les nouvelles valeurs (corps de la requête pour les créations/mises à jour)
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    details.new = { ...req.body };
    
    // Ne pas inclure le mot de passe dans les logs
    if (details.new.password) {
      details.new.password = '[REDACTED]';
    }
  }
  
  return details;
}