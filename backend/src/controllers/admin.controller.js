const User = require('../models/sql/user.model');
const auditService = require('../services/audit.service');
const statsService = require('../services/stats.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');
const { AppError } = require('../utils/error.utils');
const { roles } = require('../config/auth');

/**
 * Récupérer tous les utilisateurs
 * @route GET /api/admin/users
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  const offset = (page - 1) * limit;
  
  // Construire les conditions de recherche
  const whereConditions = {};
  
  if (role) {
    whereConditions.role = role;
  }
  
  if (search) {
    whereConditions[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  // Récupérer les utilisateurs
  const { count, rows } = await User.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] }
  });
  
  sendResponse(res, 200, 'Utilisateurs récupérés avec succès', {
    users: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit)
  });
});

/**
 * Mettre à jour le rôle d'un utilisateur
 * @route PUT /api/admin/users/:id/role
 */
exports.updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  // Vérifier que le rôle est valide
  if (!Object.values(roles).includes(role)) {
    throw new AppError('Rôle invalide', 400);
  }
  
  // Vérifier que l'utilisateur existe
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }
  
  // Ne pas permettre de modifier son propre rôle
  if (user.id === req.user.id) {
    throw new AppError('Vous ne pouvez pas modifier votre propre rôle', 403);
  }
  
  // Mettre à jour le rôle
  await user.update({ role });
  
  sendResponse(res, 200, 'Rôle mis à jour avec succès', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

/**
 * Supprimer un utilisateur
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Vérifier que l'utilisateur existe
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }
  
  // Ne pas permettre de supprimer son propre compte
  if (user.id === req.user.id) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 403);
  }
  
  // Supprimer l'utilisateur
  await user.destroy();
  
  sendResponse(res, 200, 'Utilisateur supprimé avec succès');
});

/**
 * Récupérer les logs d'audit
 * @route GET /api/admin/logs
 */
exports.getAuditLogs = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 20,
    startDate,
    endDate,
    userId,
    entityType,
    entityId,
    action
  } = req.query;
  
  const filters = {
    startDate,
    endDate,
    userId,
    entityType,
    entityId,
    action
  };
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  const result = await auditService.getLogs(filters, options);
  sendResponse(res, 200, 'Logs d\'audit récupérés avec succès', result);
});

/**
 * Récupérer les statistiques globales
 * @route GET /api/admin/stats
 */
exports.getGlobalStats = catchAsync(async (req, res) => {
  const result = await statsService.getGlobalStats();
  sendResponse(res, 200, 'Statistiques globales récupérées avec succès', result);
});

/**
 * Récupérer les statistiques d'audit
 * @route GET /api/admin/logs/stats
 */
exports.getAuditStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const filters = {
    startDate,
    endDate
  };
  
  const result = await auditService.getAuditStats(filters);
  sendResponse(res, 200, 'Statistiques d\'audit récupérées avec succès', result);
});