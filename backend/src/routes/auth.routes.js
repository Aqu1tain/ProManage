const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate, authSchemas } = require('../utils/validation.utils');
const { protect } = require('../middlewares/auth.middleware');
const { createAuditLog } = require('../middlewares/audit.middleware');

const router = express.Router();

// Routes publiques
router.post(
  '/register',
  validate(authSchemas.register),
  createAuditLog('user.register'),
  authController.register
);

router.post(
  '/join',
  validate(authSchemas.join),
  createAuditLog('user.join'),
  authController.join
);

router.post(
  '/login',
  validate(authSchemas.login),
  createAuditLog('user.login'),
  authController.login
);

// Routes protégées
router.use(protect);

router.get(
  '/me',
  authController.getProfile
);

router.put(
  '/me',
  createAuditLog('user.update_profile'),
  authController.updateProfile
);

router.put(
  '/change-password',
  createAuditLog('user.change_password'),
  authController.changePassword
);

module.exports = router;