const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');
const { createAuditLog } = require('../middlewares/audit.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification et des privilèges d'administrateur
router.use(protect);
router.use(isAdmin);

// Gestion des utilisateurs
router.get(
  '/users',
  adminController.getAllUsers
);

router.put(
  '/users/:id/role',
  createAuditLog('admin.update_user_role', { 
    entityType: 'user', 
    getEntityId: req => req.params.id,
    getDetails: req => ({ role: req.body.role })
  }),
  adminController.updateUserRole
);

router.delete(
  '/users/:id',
  createAuditLog('admin.delete_user', { entityType: 'user', getEntityId: req => req.params.id }),
  adminController.deleteUser
);

// Logs d'audit
router.get(
  '/logs',
  adminController.getAuditLogs
);

router.get(
  '/logs/stats',
  adminController.getAuditStats
);

// Statistiques globales
router.get(
  '/stats',
  adminController.getGlobalStats
);

module.exports = router;